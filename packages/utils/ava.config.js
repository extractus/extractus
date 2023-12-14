export default {
  files: ['*.spec.ts'],
  extensions: {
    ts: 'module'
  },
  nodeArguments: ['--loader=tsx/esm --experimental-wasm-modules']
}
