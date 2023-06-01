import type { Optional } from '@extractus/utils/optional.js'
import type { ParseHtmlOptions } from '@extractus/utils/parse-html.js'
import { extractors } from '@extractus/defaults/extractors.js'
import type { NestableRecord } from '@extractus/utils/nestable-record.js'
import usingExtractors from './using-extractors.js'
import transformer from '@extractus/defaults/transformer.js'
import usingTransformer from './using-transformer.js'
import type { ExtractContext } from '@extractus/utils/extract-context.js'
import type { OptionalContextProcessor } from '@extractus/utils/optional-context-processor.js'
import usingSelector from './using-selector.js'
import selector from '@extractus/defaults/selector.js'
import { filter, isntIterable, reduce, toArray } from 'iterable-operator'
import { pipe } from 'extra-utils'
import { debug, DEBUG } from './logger.js'

export type Processed<T extends OptionalContextProcessor<any, any>> =
  NestableRecord<ReturnType<T>>

export type Extractor = OptionalContextProcessor
export type Extractors = NestableRecord<Extractor>

export type Transformer = OptionalContextProcessor<Iterable<Optional<string>>>
export type Transformers = NestableRecord<Transformer>

export type Selector<T> = OptionalContextProcessor<Iterable<string>, T | string>
export type Selectors<T> = NestableRecord<Selector<T | string>>

type SelectorResult<T> = T extends Selectors<infer R> ? R : never

export interface ExtractOptions<Selected> {
  url?: string
  language?: string
  parse?: ParseHtmlOptions
  extractors?: Iterable<Extractors>
  transformer?: Transformers
  selector?: Selectors<Selected>
}

/**
 * @param input HTML to extract content
 * @param options {@link ExtractOptions}
 */
export function extract<Selected = any>(
  input: string,
  options: ExtractOptions<Selected> = {}
) {
  const actualSelector: Selectors<Selected | SelectorResult<typeof selector>> =
    options.selector ?? selector
  const actualOptions = {
    extractors,
    transformer,
    selector: actualSelector,
    ...options
  }
  if (DEBUG) debug('options')(actualOptions)
  const context = {
    url: options.url,
    language: options.language
  } satisfies ExtractContext
  return pipe(
    input,
    usingExtractors(actualOptions.extractors, context),
    debug('extracted'),
    usingTransformer(actualOptions.transformer, context),
    debug('transformed'),
    (it: Processed<Transformer>) =>
      pipe(Object.entries(it), (entries) =>
        reduce(
          entries,
          (accumulator, [key, value]) => {
            if (isntIterable(value)) {
              accumulator[key] = reduce(
                Object.entries(value),
                (accumulator, [subKey, subValue]) => {
                  const filtered = filter<string>(subValue, it => !!it)
                  accumulator[subKey] = filtered
                  if (DEBUG && filtered) accumulator[subKey] = toArray(filtered)
                  return accumulator
                },
                <Record<string, Iterable<string>>>{}
              )
              return accumulator
            }

            const filtered = filter<string>(value, it => !!it)
            accumulator[key] = filtered
            if (DEBUG && filtered) accumulator[key] = toArray(filtered)
            return accumulator
          },
          <NestableRecord<Iterable<string>>>{}
        )
      ),
    debug('filtered'),
    usingSelector(actualOptions.selector, context),
    debug('selected')
  )
}
