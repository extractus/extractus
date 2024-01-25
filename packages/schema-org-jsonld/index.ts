import type { Extractors } from '@extractus/extractus'
import extractJsonldFromHtml from '@extractus/utils/extract-jsonld-from-html.js'
import findValueFromJsonld from '@extractus/utils/find-value-from-jsonld.js'

const NOT_RATING = (it: unknown) =>
  Boolean(
    it &&
      typeof it === 'object' &&
      ['EndorsementRating', 'AggregateRating', 'Rating'].includes(<string>(<Record<string, unknown>>it)['@type'])
  )
const IS_CREATIVE_WORK = (it: unknown) => Boolean(!it || (typeof it === 'object' && !('headline' in it)))

const extractJsonld = async (input: string, path: string, ignored?: (it: unknown) => boolean) =>
  findValueFromJsonld(await extractJsonldFromHtml(input), path, ignored)

export default {
  title: async function* (input: string) {
    yield* await extractJsonld(input, 'headline')
  },
  url: async function* (input: string) {
    yield* await extractJsonld(input, 'url', IS_CREATIVE_WORK)
  },
  description: async function* (input: string) {
    yield* await extractJsonld(input, 'articleBody')
    yield* await extractJsonld(input, 'description', IS_CREATIVE_WORK)
  },
  author: {
    /**
     * @see https://schema.org/author
     */
    name: async function* (input: string) {
      yield* await extractJsonld(input, 'author.name', NOT_RATING)
      yield* await extractJsonld(input, 'author.brand', NOT_RATING)
    },
    url: async function* (input: string) {
      yield* await extractJsonld(input, 'author.url', NOT_RATING)
    }
  },
  image: async function* (input: string) {
    yield* await extractJsonld(input, 'image', IS_CREATIVE_WORK)
  },
  language: async function* (input: string) {
    yield* await extractJsonld(input, 'inLanguage', IS_CREATIVE_WORK)
  },
  date: {
    published: async function* (input: string) {
      yield* await extractJsonld(input, 'datePublished')
      yield* await extractJsonld(input, 'dateCreated', IS_CREATIVE_WORK)
    },
    modified: async function* (input: string) {
      yield* await extractJsonld(input, 'dateModified', IS_CREATIVE_WORK)
      yield* await extractJsonld(input, 'uploadDate', IS_CREATIVE_WORK)
    }
  }
} satisfies Extractors
