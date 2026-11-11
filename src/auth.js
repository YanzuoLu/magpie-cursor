/**
 * Magpie's Cursor sign-in as the grant dsh-cursor's runtime asks for. An
 * account is the browser sign-in dsh-cursor does (Cursor's Deep Control PKCE
 * login, its tokens renewed with the refresh token), the account
 * cursor-agent signed in to, whose token is read from where the CLI keeps it
 * each time and never written, or a Cursor API key.
 */
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { homedir, platform } from 'node:os'
import { join } from 'node:path'
import { LlmError } from './dsh-llm.js'
import { cursorTokenExpiry, loginCursorOAuth, refreshCursorOAuth } from 'dsh-cursor/lib/oauth.js'

export const PROVIDER = 'cursor'
/** An oauth record's refresh when the token is cursor-agent's own, as the community plugin marks it. */
export const CLI_MARK = 'cursor-agent'
const API = 'https://api2.cursor.sh'
const REFRESH_SKEW_MS = 60_000
const CLI_RENEW_MS = 5 * 60_000
const CLI_READ_TTL_MS = 10_000

const run = (file, args) => new Promise(resolve => execFile(file, args, { timeout: 20_000 }, (error, stdout) =>
  resolve({ ok: !error, out: String(stdout ?? '') })))

let cliRead = { at: 0, token: '' }
async function cliToken(fresh = false) {
  if (!fresh && Date.now() - cliRead.at < CLI_READ_TTL_MS) return cliRead.token
  let token = ''
  if (platform() === 'darwin') {
    const result = await run('security', ['find-generic-password', '-s', 'cursor-access-token', '-a', 'cursor-user', '-w'])
    if (result.ok) token = result.out.trim()
  }
  if (!token) {
    const dir = process.env.XDG_CONFIG_HOME ? join(process.env.XDG_CONFIG_HOME, 'cursor') : join(homedir(), '.cursor')
    try { token = JSON.parse(await readFile(join(dir, 'auth.json'), 'utf8'))?.accessToken ?? '' } catch {}
  }
  cliRead = { at: Date.now(), token }
  return token
}

/** cursor-agent's token, renewed by `cursor-agent status` when it is about to run out. */
async function cliGrantToken() {
  let token = await cliToken()
  if (token && cursorTokenExpiry(token) - Date.now() < CLI_RENEW_MS) {
    for (const file of [join(homedir(), '.local', 'bin', 'cursor-agent'), 'cursor-agent']) {
      if ((await run(file, ['status'])).ok) break
    }
    token = await cliToken(true)
  }
  if (!token) throw new LlmError("cursor-agent isn't signed in: run `cursor-agent login`, or sign in to Cursor again in magpie", 'CURSOR_AUTH_REQUIRED')
  if (cursorTokenExpiry(token) <= Date.now()) throw new LlmError("cursor-agent's sign-in has run out: run `cursor-agent login` again", 'CURSOR_AUTH_REQUIRED')
  return token
}

const loginIdOf = record => record.accountId
  || createHash('sha256').update(record.type === 'api' ? record.key : record.refresh ?? '').digest('hex').slice(0, 24)

/**
 * An API key's access token: the key exchanged at /auth/exchange_user_api_key,
 * as cursor-agent does with CURSOR_API_KEY, and exchanged again when the
 * token is about to run out.
 */
const exchanged = new Map()
async function keyToken(key) {
  const id = createHash('sha256').update(key).digest('hex')
  const had = exchanged.get(id)
  if (had && had.expires - Date.now() > CLI_RENEW_MS) return had.access
  const response = await fetch(`${API}/auth/exchange_user_api_key`, {
    method: 'POST', body: '{}', signal: AbortSignal.timeout(15_000),
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}`, 'x-cursor-client-type': 'cli', 'x-ghost-mode': 'true' },
  })
  if (response.status >= 500) throw new LlmError(`Cursor's API key exchange answered HTTP ${response.status}`, 'PROVIDER_ERROR', { status: 502 })
  const access = response.ok ? (await response.json().catch(() => null))?.accessToken : undefined
  if (!access) throw new LlmError("Cursor didn't take this API key", 'CURSOR_AUTH_REQUIRED')
  exchanged.set(id, { access, expires: cursorTokenExpiry(access) })
  return access
}

/** A Connect unary call in JSON on Cursor's API. */
export async function cursorUnary(path, token, body = {}, signal = AbortSignal.timeout(15_000)) {
  const response = await fetch(`${API}/${path}`, {
    method: 'POST', signal, body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', 'connect-protocol-version': '1', authorization: `Bearer ${token}`,
      'x-cursor-client-type': 'cli', 'x-ghost-mode': 'true' },
  })
  if (!response.ok) throw new LlmError(`Cursor ${path} answered HTTP ${response.status}`, 'PROVIDER_ERROR', { status: response.status })
  return await response.json()
}

/** The account's email and plan name, for magpie's account row. */
async function whoIs(token) {
  const [me, plan] = await Promise.allSettled([
    cursorUnary('aiserver.v1.DashboardService/GetMe', token),
    cursorUnary('aiserver.v1.DashboardService/GetPlanInfo', token),
  ])
  return {
    email: me.status === 'fulfilled' ? String(me.value?.email ?? '').trim() : '',
    plan: plan.status === 'fulfilled' ? String(plan.value?.planInfo?.planName ?? '').trim() : '',
  }
}

/**
 * The dsh-cursor auth contract over magpie's sign-in record: getGrant()
 * renews a browser sign-in's tokens before they run out and saves them back
 * to magpie; metadata() never makes a request.
 */
export function createCursorAuth(getAuth, client) {
  const renewed = new Map()
  let refreshing
  const current = async () => {
    const record = await getAuth()
    if (record?.type === 'api') return record.key ? record : undefined
    if (record?.type !== 'oauth') return undefined
    return renewed.get(record.refresh) ?? record
  }
  async function getGrant(signal) {
    const record = await current()
    if (!record) throw new LlmError('Cursor is not signed in: sign in to Cursor in magpie', 'CURSOR_AUTH_REQUIRED')
    const loginId = loginIdOf(record)
    if (record.type === 'api') return { type: 'oauth', loginId, access: await keyToken(record.key), refresh: 'api-key', expires: 0 }
    if (record.refresh === CLI_MARK) return { type: 'oauth', loginId, access: await cliGrantToken(), refresh: CLI_MARK, expires: 0 }
    if (record.access && (record.expires || cursorTokenExpiry(record.access)) - Date.now() > REFRESH_SKEW_MS) {
      return { type: 'oauth', loginId, access: record.access, refresh: record.refresh, expires: record.expires }
    }
    refreshing ??= (async () => {
      const tokens = await refreshCursorOAuth(record, { signal })
      const next = { ...record, ...tokens }
      renewed.set(record.refresh, next)
      renewed.set(next.refresh, next)
      await client?.auth?.set?.({ path: { id: PROVIDER }, body: next }).catch(() => {})
      return next
    })().finally(() => { refreshing = undefined })
    const next = await refreshing
    return { type: 'oauth', loginId, access: next.access, refresh: next.refresh, expires: next.expires }
  }
  async function metadata() {
    const record = await current()
    return record ? { configured: true, loginId: loginIdOf(record), needsLogin: false } : { configured: false, needsLogin: true }
  }
  return { getGrant, metadata }
}

/** Magpie's sign-in methods. */
export const signInMethods = [
  {
    type: 'oauth', label: 'Cursor (browser)',
    async authorize() {
      let shown
      const url = new Promise(resolve => { shown = resolve })
      const login = loginCursorOAuth({ notify: notice => shown(notice.url) })
      login.catch(() => shown(''))
      return {
        url: await url,
        instructions: 'Sign in to Cursor in the browser; this finishes by itself.',
        method: 'auto',
        async callback() {
          try {
            const tokens = await login
            const who = await whoIs(tokens.access)
            return { type: 'success', access: tokens.access, refresh: tokens.refresh, expires: tokens.expires,
              ...(who.email ? { accountId: who.email } : {}), ...(who.plan ? { plan: who.plan } : {}) }
          } catch (error) {
            return { type: 'failed', error: error.message }
          }
        },
      }
    },
  },
  {
    type: 'oauth', label: "cursor-agent's sign-in",
    async authorize() {
      return {
        url: '',
        instructions: 'Uses the account `cursor-agent login` signed in to.',
        method: 'auto',
        async callback() {
          const token = await cliToken(true)
          if (!token) return { type: 'failed', error: "cursor-agent isn't signed in: run `cursor-agent login`" }
          if (cursorTokenExpiry(token) <= Date.now()) return { type: 'failed', error: "cursor-agent's sign-in has run out: run `cursor-agent login` again" }
          const who = await whoIs(token)
          if (!who.email) return { type: 'failed', error: "Cursor couldn't say which account is signed in" }
          return { type: 'success', access: '', refresh: CLI_MARK, expires: 0, accountId: who.email, ...(who.plan ? { plan: who.plan } : {}) }
        },
      }
    },
  },
  { type: 'api', label: 'Cursor API key (cursor.com/dashboard → Integrations)' },
]
