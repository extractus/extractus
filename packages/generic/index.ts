import type { Extractors } from '@extractus/utils'
import { parseHtml } from '@extractus/utils'
import { flatMapAsync, mapAsync } from 'iterable-operator'

// Some itemprop is from https://schema.org/. Should be split into another extractor
export default {
  title: async function* (input: string) {
    const document = await parseHtml(input)
    yield* mapAsync(
      /**
       * Seems `.post-title, .entry-title` are from WordPress.
       * I haven't found the original of them. And there are so many website using them.
       * So, they are in `generic`
       */
      flatMapAsync(['.post-title', '.entry-title', ':is(h1, h2)[class*="title" i]'], (selector) =>
        document.querySelectorAll(selector)
      ),
      (it) => it.textContent
    )
    yield document.title
  },
  url: (input: string) =>
    mapAsync(
      flatMapAsync(
        ['.post-title a', '.entry-title a', ':is(h1, h2)[class*="title" i] a'],
        async (it) => {
          const document = await parseHtml(input)
          return document.querySelectorAll(it)
        }
      ),
      (it) => it.getAttribute('href')
    ),
  author: {
    name: (input: string) =>
      mapAsync(
        flatMapAsync(
          [
            // Should from schema.org
            '[itemprop*="author" i] [itemprop="name"]',
            '[itemprop*="author" i]',
            '[rel="author"]',
            'a[class*="author" i]',
            '[class*="author" i] a',
            'a[href*="/author/" i]',
            '[class*="author" i]'
          ],
          async (it) => {
            const document = await parseHtml(input)
            return document.querySelectorAll(it)
          }
        ),
        (it) => it.textContent
      ),
    url: async function* (input: string) {
      const document = await parseHtml(input)
      yield* mapAsync(
        flatMapAsync(
          [
            // Should from schema.org
            '[itemprop*="author" i] [itemprop="url"][href]',
            '[itemprop*="author" i][href]',
            '[rel="author"][href]',
            'a[class*="author" i][href]',
            '[class*="author" i] a[href]',
            'a[href*="/author/" i]'
          ],
          (it) => document.querySelectorAll(it)
        ),
        (it) => it.getAttribute('href')
      )
    }
  },
  date: {
    modified: (input: string) =>
      // Should from schema.org
      mapAsync(
        flatMapAsync(['[itemprop*="datemodified" i]'], async (it) => {
          const document = await parseHtml(input)
          return document.querySelectorAll(it)
        }),
        (it) => it.getAttribute('content')
      ),
    published: async function* (input: string) {
      const document = await parseHtml(input)
      // Should from schema.org
      yield document.querySelector('[itemprop*="datepublished" i]')?.getAttribute('content')
      yield* mapAsync(
        flatMapAsync(
          ['time[datetime][pubdate]', 'time[itemprop*="date" i][datetime]', 'time[datetime]'],
          (it) => document.querySelectorAll(it)
        ),
        (it) => it?.getAttribute('datetime')
      )
      yield* mapAsync(
        document.querySelectorAll('[itemprop*="date" i]'),
        (it) => it?.getAttribute('content') ?? it?.getAttribute('datetime')
      )
      yield* mapAsync(
        flatMapAsync(
          [
            '[id*="publish" i]',
            '[id*="post-timestamp" i]',
            '[class*="publish" i]',
            '[class*="post-timestamp" i]',
            '[class*="byline" i]',
            '[class*="dateline" i]',
            '[id*="metadata" i]',
            '[class*="metadata" i]',
            '[id*="date" i]',
            '[class*="date" i]',
            '[id*="post-meta" i]',
            '[class*="post-meta" i]',
            '[id*="time" i]',
            '[class*="time" i]'
          ],
          (it) => document.querySelectorAll(it)
        ),
        (it) => it?.textContent
      )
    }
  }
} satisfies Extractors
