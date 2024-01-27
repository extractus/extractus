import type { UnknownRecord } from 'type-fest/source/internal.js'
import memoize from './memoize.js'
import parseHtml from './parse-html.js'
import parseJson from './parse-json.js'

export default memoize(
  async function <T extends UnknownRecord = UnknownRecord>(input: string) {
    const document = await parseHtml(input)
    const string = document?.querySelector('script[type="application/ld+json"]')?.textContent
    if (!string) return
    return parseJson<T>(string)
  },
  { maxSize: 1 }
)
