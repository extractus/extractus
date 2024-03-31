import { safeDestr } from 'destr'
import memoize from './memoize.js'

export default memoize(<T extends Record<string, unknown>>(input: string) => safeDestr<T>(input), {
  maxSize: 4
})
