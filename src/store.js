/**
 * Durable tables in a folder of the plugin's own: one JSON file per record,
 * written atomically, with every record read once at open. dsh-cursor's
 * conversation cache and catalog read them synchronously and write them
 * through its own queue.
 */
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const fileOf = key => createHash('sha256').update(key).digest('hex') + '.json'

/** A table of JSON records, all kept in memory. */
export function recordTable(dir) {
  mkdirSync(dir, { recursive: true })
  const records = new Map()
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.json')) continue
    try {
      const { key, value } = JSON.parse(readFileSync(join(dir, name), 'utf8'))
      if (typeof key === 'string') records.set(key, value)
    } catch {
      rmSync(join(dir, name), { force: true })
    }
  }
  return {
    get: key => records.get(key),
    entries: () => records.entries(),
    keys: () => records.keys(),
    async put(key, value) {
      const file = join(dir, fileOf(key))
      writeFileSync(file + '.tmp', JSON.stringify({ key, value }))
      renameSync(file + '.tmp', file)
      records.set(key, value)
    },
    async delete(key) {
      rmSync(join(dir, fileOf(key)), { force: true })
      records.delete(key)
    },
  }
}

/** A table of immutable blobs named by their hash, read from disk on demand. */
export function blobTable(dir) {
  mkdirSync(dir, { recursive: true })
  const path = hash => join(dir, hash)
  return {
    get(hash) {
      try { return { encoded: readFileSync(path(hash), 'utf8') } } catch { return undefined }
    },
    keys: () => readdirSync(dir).filter(name => /^[0-9a-f]{64}$/u.test(name)),
    async put(hash, { encoded }) {
      writeFileSync(path(hash) + '.tmp', encoded)
      renameSync(path(hash) + '.tmp', path(hash))
    },
    async delete(hash) {
      rmSync(path(hash), { force: true })
    },
  }
}
