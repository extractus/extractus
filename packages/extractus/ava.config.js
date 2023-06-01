export default {
  files: ['*.spec.ts'],
  extensions: {
    ts: 'module'
  },
  nodeArguments: ['--loader=tsx', '--experimental-wasm-modules']
}
