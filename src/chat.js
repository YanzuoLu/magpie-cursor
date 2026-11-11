/**
 * One Chat Completions request answered by dsh-cursor's runtime. A step that
 * calls tools parks its Cursor Run; the request carrying their results
 * resumes it. Each step reports the billing counters of its own model calls.
 */
import { createHash, randomUUID } from 'node:crypto'
import { chatMessages, chatTools } from './projection.js'
import { PROVIDER } from './auth.js'

export const SESSION_HEADER = 'x-magpie-cursor-session'
/** How long a parked Run waits for its tools' results before it is closed. */
const PARKED_MS = 30 * 60_000
/** How long the response's headers wait for the first output before streaming keepalives. */
const HEADER_WAIT_MS = 10_000
const KEEPALIVE_MS = 15_000
/** Failures before any output after which a fresh Run from the request's own history is right. */
const REBUILD = new Set(['CURSOR_CONTEXT_CHANGED', 'CURSOR_TOOL_RESULT_MISMATCH', 'CURSOR_TOOL_RESULT_DUPLICATE',
  'CURSOR_TOOL_RESULT_MISSING', 'CURSOR_RUN_LOST', 'CURSOR_RUN_BUSY', 'CURSOR_TURN_CLOSED'])
/**
 * The conversation a request belongs to: what names the session (Codex's
 * prompt_cache_key, else magpie's session), with its first user message,
 * so subagents sharing a session are conversations of their own.
 */
function conversationKey(chat, session, system) {
  const key = (typeof chat.prompt_cache_key === 'string' ? chat.prompt_cache_key.trim() : '') || session || ''
  const first = (chat.messages ?? []).find(message => message?.role === 'user')
  return createHash('sha256').update(JSON.stringify(['cursor conversation', key, key ? '' : system, first?.content ?? ''])).digest('hex')
}

function statusOf(error) {
  if (Number.isInteger(error?.status) && error.status >= 400 && error.status < 600) return error.status
  switch (error?.code) {
    case 'CURSOR_AUTH_REQUIRED': case 'AUTH': return 401
    case 'RATE_LIMIT': return 429
    case 'MODEL_NOT_FOUND': case 'CURSOR_MODEL_UNAVAILABLE': return 404
    case 'ABORTED': case 'CANCELLED': return 499
    case 'INVALID_REASONING_EFFORT': case 'UNSUPPORTED_CONTENT': case 'UNSUPPORTED_OPTION': case 'INVALID_TOOL_RESULT': case 'INVALID_REQUEST': return 400
    default: return 502
  }
}

const headers = { 'x-magpie-sign-in': 'kept' }
export function errorResponse(error) {
  const status = statusOf(error)
  return new Response(JSON.stringify({ error: { message: error?.message ?? String(error), code: error?.code ?? status } }),
    { status, headers: { ...headers, 'content-type': 'application/json' } })
}

function counted(usage) {
  return { input: usage.inputTokens ?? 0, output: usage.outputTokens ?? 0, cacheRead: usage.cacheReadTokens ?? 0,
    cacheWrite: usage.cacheWriteTokens ?? 0, reasoning: usage.reasoningTokens ?? 0 }
}

const zero = () => ({ prompt: 0, completion: 0, cacheRead: 0, cacheWrite: 0 })
const add = (sum, part) => { for (const key of Object.keys(sum)) sum[key] += part[key]; return sum }
const tally = call => ({ prompt: call.input + call.cacheRead + call.cacheWrite, completion: call.output, cacheRead: call.cacheRead, cacheWrite: call.cacheWrite })

/**
 * A step's usage. Its prompt is what a client reads for how full the context
 * is: its last model call's whole prompt when Cursor counts each call, else
 * the context Cursor's checkpoint says the step occupied. What else the
 * Run used goes as magpie_deferred, which magpie counts and no client reads:
 * the step's earlier calls, and at the end of the turn whatever of Cursor's
 * own count for the whole Run its steps have not reported, so a turn adds up
 * to what Cursor counted. `reported` is the Run's running total.
 */
function stepUsage(diagnostics, occupancy, reported, final) {
  const calls = (diagnostics?.modelCalls ?? []).map(counted)
  const deferred = zero()
  let main
  if (calls.length) {
    const last = calls.at(-1)
    main = { ...tally(last), reasoning: last.reasoning }
    for (const call of calls.slice(0, -1)) add(deferred, tally(call))
  } else if (occupancy) {
    main = { prompt: occupancy.inputTokens, completion: occupancy.outputTokens, cacheRead: 0, cacheWrite: 0, reasoning: 0 }
  }
  if (main) add(reported, { prompt: main.prompt, completion: main.completion, cacheRead: main.cacheRead, cacheWrite: main.cacheWrite })
  add(reported, deferred)
  if (final && diagnostics?.turnUsage) {
    const turn = tally(counted(diagnostics.turnUsage))
    for (const key of Object.keys(turn)) {
      const rest = Math.max(0, turn[key] - reported[key])
      deferred[key] += rest
      reported[key] += rest
    }
  }
  if (!main && !deferred.prompt && !deferred.completion) return undefined
  main ??= { prompt: 0, completion: 0, cacheRead: 0, cacheWrite: 0, reasoning: 0 }
  return {
    prompt_tokens: main.prompt, completion_tokens: main.completion, total_tokens: main.prompt + main.completion,
    prompt_tokens_details: { cached_tokens: main.cacheRead, cache_write_tokens: main.cacheWrite },
    ...(main.reasoning ? { completion_tokens_details: { reasoning_tokens: main.reasoning } } : {}),
    ...(deferred.prompt || deferred.completion ? { magpie_deferred: {
      prompt_tokens: deferred.prompt, completion_tokens: deferred.completion,
      cached_tokens: deferred.cacheRead, cache_write_tokens: deferred.cacheWrite,
    } } : {}),
  }
}

const FINISH = { 'tool-calls': 'tool_calls', stop: 'stop', 'max-tokens': 'length' }

/**
 * Chat Completions answers over a dsh-cursor runtime. route(chat) is the
 * Cursor selection a request's model, effort and service tier run as, or
 * undefined for a model the account hasn't got; maxRequired(error) is
 * Cursor's refusal of a model run without Max Mode.
 */
export function createChat({ runtime, ready, route, maxRequired, logger }) {
  /** Models Cursor said it serves in Max Mode only. */
  const maxOnly = new Set()
  const parked = new Map()
  /** Usage each session's live Run has reported so far. */
  const reported = new Map()

  function unpark(sessionId) {
    clearTimeout(parked.get(sessionId))
    parked.delete(sessionId)
  }
  function park(sessionId) {
    unpark(sessionId)
    const timer = setTimeout(() => {
      parked.delete(sessionId)
      reported.delete(sessionId)
      runtime.closeTurn(sessionId, 'Cursor tool results did not come back').catch(() => {})
    }, PARKED_MS)
    timer.unref?.()
    parked.set(sessionId, timer)
  }

  /**
   * The step's events as chat deltas: { delta } or { finish, usage }. A
   * failure a fresh Run fixes is retried once, before any output.
   */
  async function* step(options, captured) {
    for (let attempt = 0, maxRetried = false; ; attempt++) {
      let emitted = false
      let occupancy
      try {
        for await (const chunk of runtime.stream(options, captured)) {
          if (chunk.type === 'text-delta') { emitted = true; yield { delta: { content: chunk.text } } }
          else if (chunk.type === 'reasoning-delta') { emitted = true; yield { delta: { reasoning_content: chunk.text } } }
          else if (chunk.type === 'tool-call-delta') { emitted = true; yield { call: { id: chunk.id, name: chunk.name, arguments: chunk.argumentsDelta } } }
          else if (chunk.type === 'usage') occupancy = chunk.usage
          else if (chunk.type === 'finish') {
            const final = chunk.reason.kind !== 'tool-calls'
            if (!reported.has(options.sessionId)) reported.set(options.sessionId, zero())
            const usage = stepUsage(chunk.replayState?.response?.diagnostics, occupancy, reported.get(options.sessionId), final)
            if (final) reported.delete(options.sessionId)
            yield { finish: FINISH[chunk.reason.kind] ?? 'stop', usage }
            return
          }
        }
        return
      } catch (error) {
        reported.delete(options.sessionId)
        const selection = captured.entry.defaultSelection
        if (!emitted && !maxRetried && !selection.maxMode && maxRequired(error?.message)) {
          maxRetried = true
          maxOnly.add(selection.wireModelId)
          captured = { ...captured, entry: { ...captured.entry, defaultSelection: { ...selection, maxMode: true } } }
          continue
        }
        if (emitted || attempt > 0 || !REBUILD.has(error?.code) || options.signal.aborted) throw error
        logger?.warn(`cursor: ${options.sessionId} rebuilding from history after ${error.code}: ${error.message}`)
        if (options.sessionId) await runtime.closeTurn(options.sessionId, error.message).catch(() => {})
      }
    }
  }

  return async function answer(chat, signal, session) {
    try {
      await ready()
      const model = String(chat.model ?? '')
      const selection = await route(chat)
      if (maxOnly.has(selection.wireModelId)) selection.maxMode = true
      const entry = { info: { id: model }, defaultSelection: selection }
      const { system, messages } = await chatMessages(chat, signal)
      const sessionId = conversationKey(chat, session, system)
      unpark(sessionId)
      // Only a step still streaming is cancelled with its request; a parked
      // Run outlives the request that handed its tools over.
      const lifetime = new AbortController()
      const cancel = () => lifetime.abort(signal.reason)
      if (signal?.aborted) cancel()
      else signal?.addEventListener('abort', cancel, { once: true })
      const options = {
        provider: PROVIDER, model, sessionId, system, messages, tools: chatTools(chat),
        signal: lifetime.signal,
      }
      const events = step(options, { entry, settings: {} })
      const done = finish => {
        signal?.removeEventListener('abort', cancel)
        if (finish === 'tool_calls') park(sessionId)
      }
      try {
        return chat.stream === false ? await whole(events, model, done) : await streamed(events, model, done)
      } catch (error) {
        done()
        throw error
      }
    } catch (error) {
      return errorResponse(error)
    }
  }
}

/** The first event, or undefined when it takes longer than the header wait. */
async function first(events) {
  let timer
  const waited = new Promise(resolve => { timer = setTimeout(resolve, HEADER_WAIT_MS, 'waiting') })
  const next = events.next()
  const result = await Promise.race([next, waited])
  clearTimeout(timer)
  return result === 'waiting' ? { pending: next } : { result }
}

async function streamed(events, model, done) {
  const id = `chatcmpl-${randomUUID()}`
  const created = Math.floor(Date.now() / 1000)
  const encoder = new TextEncoder()
  const data = value => encoder.encode(`data: ${JSON.stringify(value)}\n\n`)
  const chunk = (delta, finish = null, extra = {}) => data({ id, object: 'chat.completion.chunk', created, model,
    choices: [{ index: 0, delta, finish_reason: finish }], ...extra })
  // A failure before any output answers with its status, so magpie can try elsewhere.
  const opening = await first(events)
  let calls = 0
  let role = false
  const encode = event => {
    const out = []
    if (!role && (event.delta || event.call)) { role = true; out.push(chunk({ role: 'assistant' })) }
    if (event.delta) out.push(chunk(event.delta))
    else if (event.call) {
      out.push(chunk({ tool_calls: [{ index: calls++, id: event.call.id, type: 'function',
        function: { name: event.call.name, arguments: event.call.arguments } }] }))
    } else if (event.finish) {
      done(event.finish)
      out.push(chunk({}, event.finish, event.usage ? { usage: event.usage } : {}))
    }
    return out
  }
  const stream = new ReadableStream({
    async start(controller) {
      let keepalive
      try {
        let next = opening.result
        if (opening.pending) {
          keepalive = setInterval(() => controller.enqueue(encoder.encode(': keepalive\n\n')), KEEPALIVE_MS)
          next = await opening.pending
          clearInterval(keepalive)
        }
        while (!next.done) {
          for (const bytes of encode(next.value)) controller.enqueue(bytes)
          next = await events.next()
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (error) {
        clearInterval(keepalive)
        done()
        controller.enqueue(data({ error: { message: error?.message ?? String(error), code: statusOf(error) } }))
      }
      controller.close()
    },
    async cancel() {
      await events.return()
    },
  })
  return new Response(stream, { status: 200, headers: { ...headers, 'content-type': 'text/event-stream', 'cache-control': 'no-cache' } })
}

async function whole(events, model, done) {
  let content = '', reasoning = '', finish = 'stop', usage
  const toolCalls = []
  for await (const event of events) {
    if (event.delta?.content) content += event.delta.content
    else if (event.delta?.reasoning_content) reasoning += event.delta.reasoning_content
    else if (event.call) toolCalls.push({ id: event.call.id, type: 'function', function: { name: event.call.name, arguments: event.call.arguments } })
    else if (event.finish) ({ finish, usage } = event)
  }
  done(finish)
  const message = { role: 'assistant', content: content || null,
    ...(reasoning ? { reasoning_content: reasoning } : {}), ...(toolCalls.length ? { tool_calls: toolCalls } : {}) }
  return new Response(JSON.stringify({ id: `chatcmpl-${randomUUID()}`, object: 'chat.completion', created: Math.floor(Date.now() / 1000),
    model, choices: [{ index: 0, message, finish_reason: finish }], ...(usage ? { usage } : {}) }),
  { status: 200, headers: { ...headers, 'content-type': 'application/json' } })
}
