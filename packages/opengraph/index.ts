import parseHtml from '@extractus/utils/parse-html.js'
import type { Extractors } from '@extractus/extractus'
import { mapAsync } from 'iterable-operator'

/**
 * https://ogp.me/
 */
export default {
  title: async function* (input: string) {
    const document = await parseHtml(input)
    yield document.querySelector('meta[property="og:title"]')?.getAttribute('content')
  },
  url: async function* (input: string) {
    const document = await parseHtml(input)
    yield document.querySelector('meta[property="og:url"]')?.getAttribute('content')
  },
  description: async function* (input: string) {
    const document = await parseHtml(input)
    yield document.querySelector('meta[property="og:description"]')?.getAttribute('content')
  },
  image: (input: string) =>
    mapAsync(
      ['meta[property="og:image:secure_url"]', 'meta[property="og:image:url"]', 'meta[property="og:image"]'],
      async (it) => {
        const document = await parseHtml(input)
        return document.querySelector(it)?.getAttribute('content')
      }
    ),
  language: async function* (input: string) {
    const document = await parseHtml(input)
    yield document.querySelector('meta[property="og:locale"]')?.getAttribute('content')
  },
  author: {
    url: async function* (input: string) {
      const document = await parseHtml(input)
      // https://stackoverflow.com/a/29831974
      yield document.querySelector('meta[property="article:author"]')?.getAttribute('content')
    }
  },
  date: {
    published: async function* (input: string) {
      const document = await parseHtml(input)
      yield document.querySelector('meta[property="article:published_time"]')?.getAttribute('content')
      yield document.querySelector('meta[property*="release_date" i]')?.getAttribute('content')
    },
    modified: async function* (input: string) {
      const document = await parseHtml(input)
      yield document.querySelector('meta[property="article:modified_time"]')?.getAttribute('content')
    }
  }
} satisfies Extractors
