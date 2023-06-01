export default {
  files: ['packages/**/*.spec.ts'],
  extensions: {
    ts: 'module'
  },
  nodeArguments: ['--loader=tsx', '--experimental-wasm-modules']
}
