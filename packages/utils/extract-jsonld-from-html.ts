import parseJson from './parse-json.js'
import parseHtml from './parse-html.js'
import memoize from './memoize.js'

export default memoize(
  function <T extends Record<string, unknown> = Record<string, unknown>>(
    input: string
  ) {
    const document = parseHtml(input)
    const string = document?.querySelector(
      'script[type="application/ld+json"]'
    )?.textContent
    if (!string) return
    return parseJson<T>(string)
  },
  { maxSize: 1 }
)
