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
import { debug, debugNestedIterable } from './logger.js'
import type { SetNonNullable, Spread } from 'type-fest'
import filterUndefined from './filter-undefined.js'
import { pipeAsync } from 'extra-utils'

export type Extractor = OptionalContextProcessor
export type Extractors = NestableRecord<Extractor>
export type ExtractorReturn = ReturnType<Extractor>

export type Transformer = OptionalContextProcessor<ExtractorReturn>
export type Transformers = NestableRecord<Transformer>
export type TransformerReturn = ReturnType<Transformer>

export type Selector<T> = OptionalContextProcessor<AsyncIterable<string>, Promise<T>>
export type Selectors<T> = NestableRecord<Selector<T>>

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
export async function extract<Options extends ExtractOptions<unknown>>(
  input: string,
  options?: Options
) {
  const actualOptions = <
    SetNonNullable<
      Spread<
        {
          extractors: typeof extractors
          transformer: typeof transformer
          selector: typeof selector
        },
        Options
      >,
      'extractors' | 'transformer' | 'selector'
    >
  >{
    extractors,
    transformer,
    selector,
    ...options
  }
  debug('options', actualOptions)
  const context = {
    url: options?.url,
    language: options?.language
  } satisfies ExtractContext

  return await pipeAsync(
    pipeAsync(
      input,
      usingExtractors(actualOptions.extractors, context),
      (it) => debugNestedIterable('extracted', it),
      usingTransformer(actualOptions.transformer, context),
      (it) => debugNestedIterable('transformed', it),
      (it) => filterUndefined(it),
      (it) => debugNestedIterable('filtered', it),
      usingSelector(actualOptions.selector, context)
    ),
    (it) => debug('selected', it)
  )
}
