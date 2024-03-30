export { default as absoluteElements } from './absolute-elements.js'
export { default as closestString } from './closest-string.js'
export { default as containsChinese } from './contains-chinese.js'
export { default as createUrlPattern } from './create-url-pattern.js'
export { deepMerge, deepMergeAsync } from './deep-merge.js'
export type { DeepMerged } from './deep-merge.js'
export type { ExtractContext } from './extract-context.js'
export { default as extractJsonldFromHtml } from './extract-jsonld-from-html.js'
export type {
  Extractor,
  Extractors,
  ExtractorReturn,
  Transformer,
  Transformers,
  TransformerReturn,
  Selector,
  Selectors
} from './extractus.js'
export { default as findValueFromJsonld } from './find-value-from-jsonld.js'
export type { GetValue } from './get-value.js'
export { default as getValueByPath } from './get-value-by-path.js'
export { default as isStringAndNotBlank } from './is-string-and-not-blank.js'
export { default as memoize } from './memoize.js'
export { default as minifyHtml } from './minify-html.js'
export type { NestableRecord } from './nestable-record.js'
export { default as nestedArrayToAsyncIterable } from './nested-array-to-async-iterable.js'
export { default as nestedAsyncIterableToArray } from './nested-async-iterable-to-array.js'
export { default as normalizeUrl } from './normalize-url.js'
export type { Optional } from './optional.js'
export type { OptionalContextProcessor } from './optional-context-processor.js'
/**
 * Since it's a memozied function you can inject cache into it.
 * So that you can specify {@link Document} object be used instead of parsing
 * @see https://github.com/extractus/extractus/blob/main/packages/utils/parse-html.ts
 * @see https://github.com/planttheidea/micro-memoize#memoizedcache
 */
export { default as parseHtml } from './parse-html.js'
export { default as parseJson } from './parse-json.js'
export type { ParseNumber } from './parse-number.js'
export { default as resolveUrl } from './resolve-url.js'
export { default as sanitizeHtml } from './sanitize-html.js'
export { default as splitTitle } from './split-title.js'
