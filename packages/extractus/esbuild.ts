import { deepMerge } from '@extractus/utils'
import { build as _build, type BuildOptions } from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'
import { polyfillNode } from 'esbuild-plugin-polyfill-node'
import { wasmLoader } from 'esbuild-plugin-wasm'
import * as fs from 'node:fs/promises'

const commonOptions = <BuildOptions>{
  entryPoints: ['index.ts'],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  minifySyntax: true,
  sourcemap: true,
  color: true,
  logLevel: 'info'
}
const build = (options: BuildOptions) => _build(deepMerge(commonOptions, options))

await fs.rm('dist', { recursive: true, force: true })

console.log('Building node')
await build({
  target: 'node18',
  platform: 'node',
  outfile: 'dist/extractus.js',
  plugins: [
    nodeExternalsPlugin({
      allowWorkspaces: true
    })
  ]
})
console.log()

console.log('Building esm')
await build({
  platform: 'neutral',
  outfile: 'dist/extractus.esm.js',
  plugins: [polyfillNode(), wasmLoader()],
  mainFields: ['module', 'main'],
  conditions: ['import', 'default']
})
console.log()

console.log('Building esm bundle')
await build({
  platform: 'neutral',
  outfile: 'dist/extractus.esm.bundle.js',
  plugins: [polyfillNode(), wasmLoader({ mode: 'embedded' })],
  mainFields: ['module', 'main'],
  conditions: ['import', 'default']
})
console.log()

console.log('Building browser')
await build({
  platform: 'browser',
  outfile: 'dist/extractus.browser.js',
  external: ['urlpattern-polyfill', 'linkedom'],
  plugins: [
    wasmLoader({
      mode: 'deferred'
    })
  ]
})
console.log()

console.log('Building browser bundle')
await build({
  platform: 'browser',
  outfile: 'dist/extractus.browser.bundle.js',
  external: ['urlpattern-polyfill', 'linkedom'],
  plugins: [
    wasmLoader({
      mode: 'embedded'
    })
  ]
})
console.log()

console.log('Building minified browser bundle')
await build({
  platform: 'browser',
  outfile: 'dist/extractus.browser.bundle.min.js',
  external: ['urlpattern-polyfill', 'linkedom'],
  minify: true,
  plugins: [
    wasmLoader({
      mode: 'embedded'
    })
  ]
})
console.log()

console.log('Building node browser bundle')
await build({
  platform: 'browser',
  outfile: 'dist/extractus.node.browser.js',
  plugins: [
    nodeExternalsPlugin({
      allowList: ['linkedom']
    })
  ]
})
console.log()

console.log('Building deno')
await build({
  platform: 'neutral',
  outfile: 'dist/mod.js',
  plugins: [
    polyfillNode(),
    nodeExternalsPlugin({
      allowWorkspaces: true
    })
  ]
})
