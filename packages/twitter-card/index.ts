import type { Extractors } from '@extractus/utils/extractus.js'
import parseHtml from '@extractus/utils/parse-html.js'

/**
 * https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
 */
export default {
  title: async function* (input: string) {
    const document = await parseHtml(input)
    yield document.querySelector('meta[property="twitter:title"]')?.getAttribute('content')
  },
  url: async function* (input: string) {
    const document = await parseHtml(input)
    yield document.querySelector('meta[property="twitter:url"]')?.getAttribute('content')
  },
  description: async function* (input: string) {
    const document = await parseHtml(input)
    yield document.querySelector('meta[property="twitter:description"]')?.getAttribute('content')
  },
  image: async function* (input: string) {
    const document = await parseHtml(input)
    yield document.querySelector('meta[property="twitter:image"]')?.getAttribute('content')
  }
} satisfies Extractors
