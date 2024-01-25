import parseHtml from '@extractus/utils/parse-html.js'
import type { Extractors } from '@extractus/extractus'
import { mapAsync } from 'iterable-operator'

/**
 * https://developer.mozilla.org/docs/Web/HTML/Attributes/rel
 * https://html.spec.whatwg.org/multipage/links.html#linkTypes
 */
export default {
  url: (input: string) =>
    mapAsync(['link[rel="canonical"]', 'link[rel="alternate"]'], async (it) => {
      const document = await parseHtml(input)
      document.querySelector(it)?.getAttribute('href')
    })
} satisfies Extractors
