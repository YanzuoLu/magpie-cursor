/**
 * Chat Completions requests as dsh-cursor runtime requests, and those as
 * Cursor wire messages. The runtime imports this module in place of
 * dsh-cursor's DeepSeek Harness projection, under the same exports.
 *
 * A runtime message is { role, content: Block[], toolCallId?, isError? }, a
 * block one of text, reasoning, tool-call { id, name, arguments } or image
 * { data, mediaType, width, height }.
 */
import { createHash } from 'node:crypto'
import { LlmError } from './dsh-llm.js'

const INTERRUPTED = 'Tool use was interrupted and did not produce a result.'

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (value !== null && typeof value === 'object' && !(value instanceof Uint8Array)) {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]))
  }
  return value
}

const sha256 = data => createHash('sha256').update(data).digest('hex')

/**
 * Tool-call arguments by what they say: a client may encode the same JSON
 * again (magpie's Go encoder writes `>` as `\u003e` for a freeform tool's
 * input).
 */
function argumentsKey(args) {
  try { return JSON.stringify(canonical(JSON.parse(args))) } catch { return args }
}

/**
 * Hash only what the model sees and a client replays faithfully. Clients
 * do not all replay reasoning, and they join an assistant reply's text
 * blocks, so an assistant message counts as its joined text and its calls.
 */
export function requestFingerprint(options) {
  const value = {
    system: options.system,
    messages: (options.messages ?? []).map(message => {
      if (message.role === 'assistant') {
        return {
          role: 'assistant',
          text: message.content.filter(block => block.type === 'text').map(block => block.text).join('').trim(),
          calls: message.content.filter(block => block.type === 'tool-call').map(({ id, name, arguments: args }) => ({ id: String(id), name, args: argumentsKey(args) })),
        }
      }
      return {
        role: message.role,
        content: message.content.map(block => block.type === 'image' ? { type: 'image', hash: sha256(block.data) } : block),
        ...(message.role === 'tool' ? { toolCallId: message.toolCallId, isError: message.isError === true } : {}),
      }
    }),
  }
  return sha256(JSON.stringify(canonical(value)))
}

function wireBlock(block, role) {
  switch (block.type) {
    case 'text': return { type: 'text', text: block.text }
    case 'reasoning': return { type: 'reasoning', text: block.text }
    case 'tool-call':
      return role === 'assistant'
        ? { type: 'tool-call', id: String(block.id), name: block.name, arguments: block.arguments }
        : { type: 'text', text: JSON.stringify({ type: 'tool-call', id: String(block.id), name: block.name, arguments: block.arguments }) }
    case 'image':
      if (role !== 'user' && role !== 'tool') throw new LlmError('Cursor cannot replay image output in this message role.', 'UNSUPPORTED_CONTENT')
      return { type: 'image', data: block.data, mediaType: block.mediaType, width: block.width, height: block.height }
    default: throw new LlmError(`Cursor does not support content block type ${block.type}.`, 'UNSUPPORTED_CONTENT')
  }
}

export async function projectRequest(options, { signal = options.signal } = {}) {
  signal?.throwIfAborted()
  const names = new Map()
  for (const message of options.messages ?? []) {
    if (message.role === 'assistant') for (const block of message.content) if (block.type === 'tool-call') names.set(String(block.id), block.name)
  }
  const out = []
  if (options.system) out.push({ role: 'system', content: [{ type: 'text', text: options.system }] })
  for (const message of options.messages ?? []) {
    const content = message.content.map(block => wireBlock(block, message.role))
    if (message.role === 'tool') {
      out.push({ role: 'tool', toolCallId: String(message.toolCallId), toolName: names.get(String(message.toolCallId)), isError: message.isError === true, content })
    } else out.push({ role: message.role, content })
  }
  return out
}

export async function projectToolResult(message) {
  if (message.role !== 'tool') throw new LlmError('Cursor continuation requires a tool-role message.', 'INVALID_TOOL_RESULT')
  return { content: message.content.map(block => wireBlock(block, 'tool')), isError: message.isError === true }
}

// ---- Chat Completions -------------------------------------------------------

/** Pixel size from a PNG, JPEG, GIF or WebP header. */
export function imageSize(data) {
  const b = Buffer.from(data.buffer, data.byteOffset, data.byteLength)
  if (b.length >= 24 && b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) }
  if (b.length >= 10 && b.toString('ascii', 0, 3) === 'GIF') return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) }
  if (b.length >= 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const kind = b.toString('ascii', 12, 16)
    if (kind === 'VP8X') return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) }
    if (kind === 'VP8L') {
      const bits = b.readUInt32LE(21)
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) }
    }
    if (kind === 'VP8 ') return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff }
  }
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i + 9 < b.length;) {
      if (b[i] !== 0xff) { i++; continue }
      const marker = b[i + 1]
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) }
      }
      i += 2 + b.readUInt16BE(i + 2)
    }
  }
  throw new LlmError('Cursor image input must be PNG, JPEG, GIF or WebP.', 'UNSUPPORTED_CONTENT')
}

async function imageBlock(url, signal) {
  let data, mediaType
  const inline = /^data:([^;,]+)(;base64)?,(.*)$/su.exec(url)
  if (inline) {
    mediaType = inline[1]
    data = inline[2] ? Buffer.from(inline[3], 'base64') : Buffer.from(decodeURIComponent(inline[3]))
  } else {
    const response = await fetch(url, { signal })
    if (!response.ok) throw new LlmError(`Cursor image input could not be fetched (HTTP ${response.status}).`, 'UNSUPPORTED_CONTENT')
    mediaType = (response.headers.get('content-type') ?? '').split(';')[0].trim()
    data = Buffer.from(await response.arrayBuffer())
  }
  const bytes = new Uint8Array(data)
  return { type: 'image', data: bytes, mediaType: mediaType || 'image/png', ...imageSize(bytes) }
}

async function contentBlocks(content, signal) {
  if (typeof content === 'string') return content ? [{ type: 'text', text: content }] : []
  const blocks = []
  for (const part of content ?? []) {
    if (part?.type === 'text' && part.text) blocks.push({ type: 'text', text: part.text })
    else if (part?.type === 'image_url') blocks.push(await imageBlock(part.image_url?.url ?? part.image_url, signal))
  }
  return blocks
}

const textOf = content => typeof content === 'string' ? content
  : Array.isArray(content) ? content.filter(part => part?.type === 'text').map(part => part.text ?? '').join('') : ''
const reasoningOf = message => [message.reasoning_content, message.reasoning].find(value => typeof value === 'string' && value.trim()) ?? ''

/** The caller's tools the model may call: none for tool_choice "none", the one named when one is. */
export function chatTools(chat) {
  const choice = chat.tool_choice
  if (choice === 'none') return []
  const only = typeof choice === 'object' ? choice?.function?.name : undefined
  return (chat.tools ?? [])
    .filter(tool => tool?.type === 'function' && tool.function?.name && (!only || tool.function.name === only))
    .map(tool => ({
      name: tool.function.name,
      description: tool.function.description ?? '',
      parameters: tool.function.parameters ?? { type: 'object', properties: {} },
    }))
}

/**
 * A chat's system prompt and runtime messages. Leading system messages are
 * the system prompt; later ones are developer instructions. Consecutive
 * assistant messages are one reply, as an agent may split a reply's
 * parallel calls over two of them. A call no result answers is answered as
 * interrupted, as Cursor wants every call to have its result.
 */
export async function chatMessages(chat, signal) {
  const system = []
  const messages = []
  for (const message of chat.messages ?? []) {
    switch (message?.role) {
      case 'system':
        if (!messages.length) system.push(textOf(message.content))
        else messages.push({ role: 'developer', content: [{ type: 'text', text: textOf(message.content) }] })
        break
      case 'developer':
        messages.push({ role: 'developer', content: [{ type: 'text', text: textOf(message.content) }] })
        break
      case 'user':
        messages.push({ role: 'user', content: await contentBlocks(message.content, signal) })
        break
      case 'assistant': {
        const content = []
        const reasoning = reasoningOf(message)
        if (reasoning) content.push({ type: 'reasoning', text: reasoning })
        const text = textOf(message.content)
        if (text) content.push({ type: 'text', text })
        for (const call of message.tool_calls ?? []) {
          if (call?.type !== 'function' && call?.type !== undefined) continue
          const args = call.function?.arguments
          content.push({ type: 'tool-call', id: String(call.id), name: call.function?.name ?? '',
            arguments: typeof args === 'string' ? args || '{}' : JSON.stringify(args ?? {}) })
        }
        const previous = messages.at(-1)
        if (previous?.role === 'assistant') previous.content.push(...content)
        else if (content.length) messages.push({ role: 'assistant', content })
        break
      }
      case 'tool':
        messages.push({ role: 'tool', toolCallId: String(message.tool_call_id), content: await contentBlocks(message.content, signal), isError: false })
        break
      default: break
    }
  }
  const out = []
  for (let i = 0; i < messages.length; i++) {
    out.push(messages[i])
    if (messages[i].role !== 'assistant') continue
    const calls = messages[i].content.filter(block => block.type === 'tool-call').map(block => block.id)
    let j = i + 1
    const answered = new Set()
    for (; j < messages.length && messages[j].role === 'tool'; j++) {
      answered.add(messages[j].toolCallId)
      out.push(messages[j])
    }
    for (const id of calls) {
      if (!answered.has(id)) out.push({ role: 'tool', toolCallId: id, content: [{ type: 'text', text: INTERRUPTED }], isError: true })
    }
    i = j - 1
  }
  return { system: system.filter(Boolean).join('\n\n'), messages: out }
}
