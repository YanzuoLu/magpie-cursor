/**
 * The few @deepseek-ai/dsh-llm values dsh-cursor's protocol, catalog, OAuth
 * and runtime modules use, as plain values outside DeepSeek Harness.
 */
export class LlmError extends Error {
  constructor(message, code, options) {
    super(message, options?.cause === undefined ? undefined : { cause: options.cause })
    this.name = 'LlmError'
    this.code = code
    if (options?.status !== undefined) this.status = options.status
    if (options?.offloadImages !== undefined) this.offloadImages = options.offloadImages
  }
}

export const ReasoningEffortId = id => id
export const ToolCallId = id => id

/** Magpie sends no host identity of its own to Cursor. */
export const attributionHeaders = () => ({})

export function createAssistantMessage({ content, source }) {
  return { role: 'assistant', content, ...(source ? { source } : {}) }
}
