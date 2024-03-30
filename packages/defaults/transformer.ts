import type { ExtractContext, ExtractorReturn, Transformers } from '@extractus/utils'
import { isStringAndNotBlank, normalizeUrl, resolveUrl, splitTitle } from '@extractus/utils'
import isURI from '@stdlib/assert-is-uri'
import condenseWhitespace from 'condense-whitespace'
import { pipe } from 'extra-utils'
import isAbsoluteUrl from 'is-absolute-url'
import { filterAsync, flatMapAsync, mapAsync } from 'iterable-operator'

/**
 * @package
 */
export const notBlank = (values: ExtractorReturn) =>
  <AsyncIterable<string>>filterAsync(values, isStringAndNotBlank)

/**
 * @package
 */
export const condense = (values: AsyncIterable<string>) => mapAsync(values, condenseWhitespace)

/**
 * @package
 */
export const processUrl = (values: ExtractorReturn, context?: ExtractContext) =>
  mapAsync(values, (it) => {
    if (it) {
      const result = resolveUrl(it, context?.url)
      return isAbsoluteUrl(result) ? normalizeUrl(result) : result
    }
    return
  })

/**
 * Transform the extracted strings.
 */
export default {
  title: (values: ExtractorReturn) =>
    pipe(values, notBlank, condense, (it) => flatMapAsync(it, splitTitle)),
  url: processUrl,
  author: {
    name: (values: ExtractorReturn) =>
      pipe(values, () => filterAsync(values, (it) => !isURI(it)), notBlank, condense),
    url: processUrl
  },
  image: processUrl,
  language: notBlank,
  description: (values: ExtractorReturn) => pipe(values, notBlank, condense),
  date: {
    published: notBlank,
    modified: notBlank
  }
} satisfies Transformers
