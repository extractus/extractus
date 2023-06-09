import parseHtml from '@extractus/utils/parse-html.js'
import type { Extractors } from '@extractus/extractus'
import { map } from 'iterable-operator'

/**
 * https://developer.mozilla.org/docs/Web/HTML/Attributes/rel
 * https://html.spec.whatwg.org/multipage/links.html#linkTypes
 */
export default {
  url: (input: string) =>
    map(['link[rel="canonical"]', 'link[rel="alternate"]'], (it) =>
      parseHtml(input).querySelector(it)?.getAttribute('href')
    )
} satisfies Extractors
