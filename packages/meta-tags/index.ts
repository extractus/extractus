import type { Extractors } from '@extractus/utils/extractus.js'
import parseHtml from '@extractus/utils/parse-html.js'

/**
 * https://www.w3.org/TR/2011/WD-html5-author-20110809/the-meta-element.html#standard-metadata-names
 */
export default {
  description: async function* (input: string) {
    const document = await parseHtml(input)
    yield document.querySelector('meta[name="description"]')?.getAttribute('content')
  },
  author: {
    name: async function* (input: string) {
      const document = await parseHtml(input)
      yield document.querySelector('meta[name="author"]')?.getAttribute('content')
    }
  }
} satisfies Extractors
