import resolve from '@jridgewell/resolve-uri'

// So that the autocompletion can work
export default <typeof resolve.default>(<unknown>resolve)
