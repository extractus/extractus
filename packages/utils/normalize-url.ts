import type { Options } from 'normalize-url'
import _normalizeUrl from 'normalize-url'
import memoize from './memoize.js'

export default memoize(
  (url: string, options?: Options) =>
    _normalizeUrl(url, {
      ...options,
      stripWWW: false,
      sortQueryParameters: false,
      removeTrailingSlash: false
    }),
  { maxSize: 16 }
)
