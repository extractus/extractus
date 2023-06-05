import parseHtml from '@extractus/utils/parse-html.js'
import type { Extractors } from '@extractus/extractus'

/**
 * https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
 */
export default {
  title: function* (input: string) {
    yield parseHtml(input)
      .querySelector('meta[property="twitter:title"]')
      ?.getAttribute('content')
  },
  url: function* (input: string) {
    yield parseHtml(input)
      .querySelector('meta[property="twitter:url"]')
      ?.getAttribute('content')
  },
  description: function* (input: string) {
    yield parseHtml(input)
      .querySelector('meta[property="twitter:description"]')
      ?.getAttribute('content')
  },
  image:  function* (input: string) {
    yield parseHtml(input)
      .querySelector('meta[property="twitter:image"]')
      ?.getAttribute('content')
  }
} satisfies Extractors
