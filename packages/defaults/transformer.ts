import type { Transformers } from '@extractus/extractus'
import isStringAndNotBlank from '@extractus/utils/is-string-and-not-blank.js'
import condenseWhitespace from 'condense-whitespace'
import type { Optional } from '@extractus/utils/optional.js'
import splitTitle from '@extractus/utils/split-title.js'
import { filter, flatMap, map } from 'iterable-operator'
import normalizeUrl from '@extractus/utils/normalize-url.js'
import resolveUrl from '@extractus/utils/resolve-url.js'
import isAbsoluteUrl from 'is-absolute-url'
import isURI from '@stdlib/assert-is-uri'
import type { ExtractContext } from '@extractus/utils/extract-context.js'
import { pipe } from 'extra-utils'

/**
 * @package
 */
export const notBlank = (values: Iterable<Optional<string>>) => <Iterable<string>>filter(values, isStringAndNotBlank)

/**
 * @package
 */
export const condense = (values: Iterable<string>) => map(values, condenseWhitespace)

/**
 * @package
 */
export const processUrl = (values: Iterable<Optional<string>>, context?: ExtractContext) =>
  map(values, (it) => {
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
  title: (values: Iterable<Optional<string>>) => pipe(values, notBlank, condense, (it) => flatMap(it, splitTitle)),
  url: processUrl,
  author: {
    name: (values: Iterable<Optional<string>>) =>
      pipe(values, (it) => filter(it, (it) => !isURI(it)), notBlank, condense),
    url: processUrl
  },
  image: processUrl,
  language: notBlank,
  description: (values: Iterable<Optional<string>>) => pipe(values, notBlank, condense),
  date: {
    published: notBlank,
    modified: notBlank
  }
} satisfies Transformers
