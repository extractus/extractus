import parseHtml from '@extractus/utils/parse-html.js'
import type { Extractors } from '@extractus/extractus'
import { map } from 'iterable-operator'

/**
 * https://ogp.me/
 */
export default {
  title: function* (input: string) {
    yield parseHtml(input).querySelector('meta[property="og:title"]')?.getAttribute('content')
  },
  url: function* (input: string) {
    yield parseHtml(input).querySelector('meta[property="og:url"]')?.getAttribute('content')
  },
  description: function* (input: string) {
    yield parseHtml(input).querySelector('meta[property="og:description"]')?.getAttribute('content')
  },
  image: (input: string) =>
    map(['meta[property="og:image:secure_url"]', 'meta[property="og:image:url"]', 'meta[property="og:image"]'], (it) =>
      parseHtml(input).querySelector(it)?.getAttribute('content')
    ),
  language: function* (input: string) {
    yield parseHtml(input).querySelector('meta[property="og:locale"]')?.getAttribute('content')
  },
  author: {
    url: function* (input: string) {
      // https://stackoverflow.com/a/29831974
      yield parseHtml(input).querySelector('meta[property="article:author"]')?.getAttribute('content')
    }
  },
  date: {
    published: function* (input: string) {
      yield parseHtml(input).querySelector('meta[property="article:published_time"]')?.getAttribute('content')
      yield parseHtml(input).querySelector('meta[property*="release_date" i]')?.getAttribute('content')
    },
    modified: function* (input: string) {
      yield parseHtml(input).querySelector('meta[property="article:modified_time"]')?.getAttribute('content')
    }
  }
} satisfies Extractors
