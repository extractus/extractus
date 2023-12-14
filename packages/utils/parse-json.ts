import memoize from './memoize.js'

export default memoize(<T extends Record<string, unknown>>(input: string) => <T>JSON.parse(input), { maxSize: 4 })
