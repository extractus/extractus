import parseHtml from '@extractus/utils/parse-html.js'
import type { Extractors } from '@extractus/extractus'
import { flatMap, map } from 'iterable-operator'

// Some itemprop is from https://schema.org/. Should be split into another extractor
export default {
  title: function* (input: string) {
    yield* map(
      /**
       * Seems `.post-title, .entry-title` are from WordPress.
       * I haven't found the original of them. And there are so many website using them.
       * So, they are in `generic`
       */
      flatMap(['.post-title', '.entry-title', ':is(h1, h2)[class*="title" i]'], (it) =>
        parseHtml(input).querySelectorAll(it)
      ),
      (it) => it.textContent
    )
    yield parseHtml(input).title
  },
  url: (input: string) =>
    map(
      flatMap(['.post-title a', '.entry-title a', ':is(h1, h2)[class*="title" i] a'], (it) =>
        parseHtml(input).querySelectorAll(it)
      ),
      (it) => it.getAttribute('href')
    ),
  author: {
    name: (input: string) =>
      map(
        flatMap(
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
          (it) => parseHtml(input).querySelectorAll(it)
        ),
        (it) => it.textContent
      ),
    url: function* (input: string) {
      yield* map(
        flatMap(
          [
            // Should from schema.org
            '[itemprop*="author" i] [itemprop="url"][href]',
            '[itemprop*="author" i][href]',
            '[rel="author"][href]',
            'a[class*="author" i][href]',
            '[class*="author" i] a[href]',
            'a[href*="/author/" i]'
          ],
          (it) => parseHtml(input).querySelectorAll(it)
        ),
        (it) => it.getAttribute('href')
      )
    }
  },
  date: {
    modified: (input: string) =>
      // Should from schema.org
      map(parseHtml(input).querySelectorAll('[itemprop*="datemodified" i]'), (it) => it.getAttribute('content')),
    published: function* (input: string) {
      const document = parseHtml(input)
      // Should from schema.org
      yield document.querySelector('[itemprop*="datepublished" i]')?.getAttribute('content')
      yield document.querySelector('time[datetime][pubdate]')?.getAttribute('datetime')
      yield document.querySelector('time[itemprop*="date" i][datetime]')?.getAttribute('datetime')
      yield document.querySelector('time[datetime]')?.getAttribute('datetime')
      yield document.querySelector('[itemprop*="date" i]')?.getAttribute('content')
      yield* map(
        flatMap(
          [
            '[id*="publish" i]',
            '[id*="post-timestamp" i]',
            '[class*="publish" i]',
            '[class*="post-timestamp" i]',
            '[class*="byline" i]',
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