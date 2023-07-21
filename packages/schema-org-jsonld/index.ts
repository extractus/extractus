import type { Extractors } from '@extractus/extractus'
import extractJsonldFromHtml from '@extractus/utils/extract-jsonld-from-html.js'
import findValueFromJsonld from '@extractus/utils/find-value-from-jsonld.js'
import { concat } from 'iterable-operator'

const NOT_RATING = (it: unknown) =>
  Boolean(
    it &&
      typeof it === 'object' &&
      ['EndorsementRating', 'AggregateRating', 'Rating'].includes(<string>(<Record<string, unknown>>it)['@type'])
  )
const IS_CREATIVE_WORK = (it: unknown) => Boolean(!it || typeof it !== 'object' || !('headline' in it))

const extractJsonld = (input: string, path: string, ignored?: (it: unknown) => boolean) =>
  findValueFromJsonld(extractJsonldFromHtml(input), path, ignored)

export default {
  title: (input: string) => extractJsonld(input, 'headline'),
  url: (input: string) => extractJsonld(input, 'url', IS_CREATIVE_WORK),
  description: (input: string) =>
    concat(extractJsonld(input, 'articleBody'), extractJsonld(input, 'description', IS_CREATIVE_WORK)),
  author: {
    /**
     * @see https://schema.org/author
     */
    name: (input: string) =>
      concat(extractJsonld(input, 'author.name', NOT_RATING), extractJsonld(input, 'author.brand', NOT_RATING)),
    url: (input: string) => extractJsonld(input, 'author.url', NOT_RATING)
  },
  image: (input: string) => extractJsonld(input, 'image', IS_CREATIVE_WORK),
  language: (input: string) => extractJsonld(input, 'inLanguage', IS_CREATIVE_WORK),
  date: {
    published: (input: string) =>
      concat(extractJsonld(input, 'datePublished'), extractJsonld(input, 'dateCreated', IS_CREATIVE_WORK)),
    modified: (input: string) =>
      concat(
        extractJsonld(input, 'dateModified', IS_CREATIVE_WORK),
        extractJsonld(input, 'uploadDate', IS_CREATIVE_WORK)
      )
  }
} satisfies Extractors
