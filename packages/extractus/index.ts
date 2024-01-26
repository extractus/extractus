import type { ParseHtmlOptions } from '@extractus/utils/parse-html.js'
import { extractors } from '@extractus/defaults/extractors.js'
import type { NestableRecord } from '@extractus/utils/nestable-record.js'
import { usingExtractors } from './using-extractors.js'
import transformer from '@extractus/defaults/transformer.js'
import usingTransformer from './using-transformer.js'
import type { ExtractContext } from '@extractus/utils/extract-context.js'
import type { OptionalContextProcessor } from '@extractus/utils/optional-context-processor.js'
import usingSelector from './using-selector.js'
import selector from '@extractus/defaults/selector.js'
import { debug, DEBUG } from './logger.js'
import type { SetNonNullable, Spread } from 'type-fest'
import filterUndefined from './filter-undefined.js'
import arrayResultToAsyncIterable from '@extractus/utils/array-result-to-async-iterable.js'

export type Extractor = OptionalContextProcessor
export type Extractors = NestableRecord<Extractor>
export type ExtractorReturn = ReturnType<Extractor>

export type Transformer = OptionalContextProcessor<ExtractorReturn>
export type Transformers = NestableRecord<Transformer>
export type TransformerReturn = ReturnType<Transformer>

export type Selector<T> = OptionalContextProcessor<AsyncIterable<string>, Promise<T>>
export type Selectors<T> = NestableRecord<Selector<T>>
export type SelectorReturn<T> = ReturnType<Selector<T>>

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
  debug('options')(actualOptions)
  const context = {
    url: options?.url,
    language: options?.language
  } satisfies ExtractContext
  let current = await usingExtractors(actualOptions.extractors, context)(input)
  debug('extracted')(current)
  if (DEBUG) current = await arrayResultToAsyncIterable(current)
  current = await usingTransformer(actualOptions.transformer, context)(current)
  debug('transformed')(current)
  if (DEBUG) current = await arrayResultToAsyncIterable(current)
  current = await filterUndefined(current)
  debug('filtered')(current)
  if (DEBUG) current = await arrayResultToAsyncIterable(current)
  current = await usingSelector(actualOptions.selector, context)(current)
  debug('selected')(current)
  return current
}
