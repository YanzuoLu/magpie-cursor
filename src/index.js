/**
 * Cursor subscriptions in magpie. Requests run on dsh-cursor: its wire
 * protocol, Run runtime and OAuth, with a Chat Completions front and durable
 * conversation checkpoints in a folder of the plugin's own. What magpie shows
 * is the community Cursor plugin's own, so the two serve the same models
 * under the same ids: its model list, how a model id, effort and service tier
 * pick Cursor's variant, its plan usage and its calls outside magpie.
 */
import { appendFileSync, mkdirSync, renameSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { CursorRuntime } from 'dsh-cursor/lib/runtime.js'
import { createConversationCache } from 'dsh-cursor/lib/conversation-cache.js'
import { CursorAuthPlugin, _internal as community } from '@magpie-community/opencode-cursor-auth/index.mjs'
import { CLI_MARK, PROVIDER, createCursorAuth, signInMethods } from './auth.js'
import { SESSION_HEADER, createChat, errorResponse } from './chat.js'
import { blobTable, recordTable } from './store.js'

const API = 'https://api2.cursor.sh'
const LOG_BYTES = 4 << 20
/** The community plugin's switches this plugin reads too. */
const OPTIONS = new Set(['included_only'])

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

/** A request's Cursor selection, as the community plugin picks the variant. */
async function routeFor(auth, chat) {
  const grant = await auth.getGrant()
  const raw = await community.listFor(grant.access)
  const model = String(chat.model ?? '')
  // fast only when asked: a service tier of priority or fast is on, any other off
  const tier = chat.service_tier
  const fast = tier === 'priority' || tier === 'fast' ? true : tier ? false : undefined
  const { id, params, maxMode } = community.request(raw, model, chat.reasoning_effort ?? '', fast)
  return {
    wireModelId: id, maxMode: maxMode === true,
    ...(params.length ? { parameters: params.map(({ id: key, value }) => ({ key, value: String(value) })) } : {}),
  }
}

/** One provider per process, whatever number of times magpie loads the plugin. */
let provider
async function providerFor(input) {
  if (provider) return provider
  const dir = process.env.MAGPIE_CURSOR_DATA ?? join(process.env.XDG_DATA_HOME || join(homedir(), '.local', 'share'), 'magpie-cursor')
  mkdirSync(dir, { recursive: true })
  const logger = fileLogger(join(dir, 'cursor.log'))
  // The sign-in magpie last handed over; every request reads it afresh.
  let getAuth = async () => undefined
  const auth = createCursorAuth(() => getAuth(), input?.client)
  const conversationCache = createConversationCache(recordTable(join(dir, 'conversations')), logger, blobTable(join(dir, 'blobs')))
  // The selection is made per request; the runtime runs it as it is.
  const selections = { select: entry => entry.defaultSelection }
  const runtime = new CursorRuntime({ logger: () => logger }, auth, selections, { conversationCache })
  let loginId
  /** A runtime that has forgotten any other account's Runs. */
  async function ready() {
    const metadata = await auth.metadata()
    if (metadata.loginId !== loginId) {
      loginId = metadata.loginId
      await runtime.invalidateAccount(loginId)
    }
  }
  provider = {
    community: await CursorAuthPlugin(input),
    setAuth(next) { getAuth = next },
    answer: createChat({ runtime, ready, logger, route: chat => routeFor(auth, chat), maxRequired: community.maxRequired }),
  }
  return provider
}

export async function MagpieCursorPlugin(input) {
  const cursor = await providerFor(input)
  const shown = cursor.community
  return {
    auth: {
      provider: PROVIDER,
      async loader(getAuth) {
        const record = await getAuth()
        const signedIn = record?.type === 'api' ? !!record.key : record?.type === 'oauth' && (!!record.access || record.refresh === CLI_MARK)
        if (!signedIn) return {}
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
      options: shown.auth.options.filter(option => OPTIONS.has(option.key)),
      usage: shown.auth.usage,
      calls: shown.auth.calls,
    },
    'chat.headers': shown['chat.headers'],
    config: shown.config,
    provider: shown.provider,
  }
}
