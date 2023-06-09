import parseHtml from '@extractus/utils/parse-html.js'
import type { Extractors } from '@extractus/extractus'

/**
 * https://www.w3.org/TR/2011/WD-html5-author-20110809/the-meta-element.html#standard-metadata-names
 */
export default {
  description: function* (input: string) {
    yield parseHtml(input).querySelector('meta[name="description"]')?.getAttribute('content')
  },
  author: {
    name: function* (input: string) {
      yield parseHtml(input).querySelector('meta[name="author"]')?.getAttribute('content')
    }
  }
} satisfies Extractors
