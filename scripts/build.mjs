import { build } from 'esbuild'
import { realpathSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const dsh = realpathSync(join(root, 'node_modules', 'dsh-cursor'))

/**
 * dsh-cursor's modules, with this package's Chat Completions projection in
 * place of its DeepSeek Harness one, and plain values for @deepseek-ai/dsh-llm.
 */
const reuse = {
  name: 'dsh-cursor',
  setup(build) {
    build.onResolve({ filter: /^dsh-cursor\// }, args => ({ path: join(dsh, args.path.slice('dsh-cursor/'.length)) }))
    build.onResolve({ filter: /^@deepseek-ai\/dsh-llm$/ }, () => ({ path: join(root, 'src', 'dsh-llm.js') }))
    build.onResolve({ filter: /^\.\/projection\.js$/ }, args => dirname(args.importer) === join(dsh, 'lib')
      ? { path: join(root, 'src', 'projection.js') } : undefined)
  },
}

await build({
  absWorkingDir: root,
  entryPoints: ['src/index.js'],
  outfile: 'dist/index.mjs',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  plugins: [reuse],
  legalComments: 'inline',
  banner: { js: '/* magpie-cursor: dsh-cursor (MIT, Yanzuo Lu) in magpie. Upstream notices in dsh-cursor UPSTREAM.md. */' },
})
console.log('built dist/index.mjs')
