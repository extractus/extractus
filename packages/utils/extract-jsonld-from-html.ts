import parseJson from './parse-json.js'
import parseHtml from './parse-html.js'
import memoize from './memoize.js'
import type { UnknownRecord } from 'type-fest/source/internal.js'

export default memoize(
  function <T extends UnknownRecord = UnknownRecord>(input: string) {
    const document = parseHtml(input)
    const string = document?.querySelector('script[type="application/ld+json"]')?.textContent
    if (!string) return
    return parseJson<T>(string)
  },
  { maxSize: 1 }
)
