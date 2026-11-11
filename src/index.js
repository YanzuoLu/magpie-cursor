/**
 * Cursor subscriptions in magpie through dsh-cursor: its wire protocol, Run
 * runtime, model catalog and OAuth, with a Chat Completions front and
 * durable conversation checkpoints in a folder of the plugin's own.
 */
import { appendFileSync, mkdirSync, renameSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { CursorRuntime } from 'dsh-cursor/lib/runtime.js'
import { createCursorCatalog } from 'dsh-cursor/lib/catalog.js'
import { createConversationCache } from 'dsh-cursor/lib/conversation-cache.js'
import { CLI_MARK, PROVIDER, createCursorAuth, signInMethods } from './auth.js'
import { SESSION_HEADER, createChat, effortVariants, errorResponse } from './chat.js'
import { blobTable, recordTable } from './store.js'

const API = 'https://api2.cursor.sh'
const CHAT = '@ai-sdk/openai-compatible'
const DEFAULT_CONTEXT = 200_000
const CATALOG_KEEP_MS = 10 * 60_000
const LOG_BYTES = 4 << 20

function fileLogger(file) {
  return {
    warn(message) {
      try {
        if (statSync(file, { throwIfNoEntry: false })?.size > LOG_BYTES) renameSync(file, file + '.1')
        appendFileSync(file, `${new Date().toISOString()} ${message}\n`)
      } catch {}
    },
  }
}

/** One provider per process, whatever number of times magpie loads the plugin. */
let provider
function providerFor(input) {
  if (provider) return provider
  const dir = process.env.MAGPIE_CURSOR_DATA ?? join(process.env.XDG_DATA_HOME || join(homedir(), '.local', 'share'), 'magpie-cursor')
  mkdirSync(dir, { recursive: true })
  const logger = fileLogger(join(dir, 'cursor.log'))
  // The sign-in magpie last handed over; every request reads it afresh.
  let getAuth = async () => undefined
  const auth = createCursorAuth(() => getAuth(), input?.client)
  const catalogs = recordTable(join(dir, 'catalog'))
  const cached = catalogs.get('default')
  const catalog = createCursorCatalog(auth, {
    cached, save: value => value === null ? catalogs.delete('default') : catalogs.put('default', value),
  })
  let checkedAt = cached?.checkedAt ?? 0
  let refreshing
  const refresh = () => refreshing ??= catalog.refresh()
    .then(entries => { checkedAt = Date.now(); return entries })
    .finally(() => { refreshing = undefined })
  const conversationCache = createConversationCache(recordTable(join(dir, 'conversations')), logger, blobTable(join(dir, 'blobs')))
  const runtime = new CursorRuntime({ logger: () => logger }, auth, catalog, { conversationCache })
  let loginId
  /** A catalog for the signed-in account, and a runtime that has forgotten any other one's Runs. */
  async function ready() {
    const metadata = await auth.metadata()
    if (metadata.loginId !== loginId) {
      loginId = metadata.loginId
      await runtime.invalidateAccount(loginId)
    }
    if (!catalog.entries().length) await refresh()
    else if (Date.now() - checkedAt > CATALOG_KEEP_MS) refresh().catch(() => {})
  }
  provider = {
    catalog, refresh, ready,
    setAuth(next) { getAuth = next },
    answer: createChat({ runtime, catalog, ready, logger }),
  }
  return provider
}

function magpieModel(entry) {
  const variants = effortVariants(entry)
  const context = entry.info.context?.contextWindow ?? DEFAULT_CONTEXT
  return {
    id: entry.info.id, providerID: PROVIDER, name: entry.info.name,
    api: { id: entry.info.id, url: API, npm: CHAT },
    status: 'active', headers: {}, options: {},
    cost: { input: 0, output: 0, cache: { read: 0, write: 0 } },
    limit: { context, output: 0 },
    capabilities: {
      temperature: false, reasoning: variants.size > 0, attachment: true, toolcall: true,
      input: { text: true, image: entry.info.inputModalities.includes('image'), audio: false, video: false, pdf: false },
      output: { text: true, image: false, audio: false, video: false, pdf: false },
      interleaved: false,
    },
    release_date: '',
    variants: Object.fromEntries([...variants.keys()].map(level => [level, { reasoningEffort: level }])),
  }
}

export async function MagpieCursorPlugin(input) {
  const cursor = providerFor(input)
  return {
    auth: {
      provider: PROVIDER,
      async loader(getAuth) {
        const record = await getAuth()
        if (record?.type !== 'oauth' || (!record.access && record.refresh !== CLI_MARK)) return {}
        cursor.setAuth(getAuth)
        return {
          baseURL: API,
          apiKey: 'cursor',
          async fetch(request, init = {}) {
            const url = typeof request === 'string' ? request : request instanceof URL ? request.href : request.url
            if (!/\/chat\/completions$/u.test(new URL(url).pathname)) {
              return errorResponse(Object.assign(new Error('only chat completions are served'), { status: 404 }))
            }
            let chat
            try {
              const body = init.body ?? (request instanceof Request ? await request.clone().text() : undefined)
              chat = JSON.parse(typeof body === 'string' ? body : new TextDecoder().decode(body))
            } catch {
              return errorResponse(Object.assign(new Error("a request that isn't JSON"), { status: 400 }))
            }
            const headers = new Headers(init.headers ?? (request instanceof Request ? request.headers : undefined))
            const signal = init.signal ?? (request instanceof Request ? request.signal : undefined)
            return cursor.answer(chat, signal, headers.get(SESSION_HEADER) ?? '')
          },
        }
      },
      methods: signInMethods,
    },
    // The session a request is part of, for its conversation; put on Cursor's requests alone.
    async 'chat.headers'(hook, output) {
      if (hook?.model?.providerID !== PROVIDER && hook?.provider?.info?.id !== PROVIDER) return
      const session = String(hook?.sessionID ?? '').trim()
      // magpie names a conversation with no session of its own after its first message.
      if (session && !/^magpie-[0-9a-f]{24}$/u.test(session)) output.headers[SESSION_HEADER] = session.slice(0, 128)
    },
    async config(config) {
      config.provider ??= {}
      const was = config.provider[PROVIDER] ?? {}
      config.provider[PROVIDER] = { name: 'Cursor', npm: CHAT, api: API, ...was,
        models: { ...Object.fromEntries(cursor.catalog.entries().map(entry => [entry.info.id, {
          name: entry.info.name, limit: { context: entry.info.context?.contextWindow ?? DEFAULT_CONTEXT, output: 0 },
          attachment: true, tool_call: true,
        }])), ...was.models } }
    },
    provider: {
      id: PROVIDER,
      async models(magpieProvider, { auth } = {}) {
        if (!auth) return magpieProvider.models
        cursor.setAuth(async () => auth)
        await cursor.ready()
        return Object.fromEntries(cursor.catalog.entries().map(entry => [entry.info.id, magpieModel(entry)]))
      },
    },
  }
}
