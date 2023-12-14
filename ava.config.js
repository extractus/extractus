export default {
  files: ['packages/**/*.spec.ts'],
  extensions: {
    ts: 'module'
  },
  nodeArguments: ['--loader=tsx/esm', '--experimental-wasm-modules']
}
