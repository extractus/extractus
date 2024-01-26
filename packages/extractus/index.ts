import type { ParseHtmlOptions } from '@extractus/utils/parse-html.js'
import type { DefaultExtracted } from '@extractus/defaults/extractors.js'
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
import type { IterableElement, SetNonNullable, Spread, ValueOf } from 'type-fest'
import filterUndefined from './filter-undefined.js'
import { pipeAsync } from 'extra-utils'
import { firstAsync, isntAsyncIterable, toAsyncIterable } from 'iterable-operator'
import type { DeepMerged } from '@extractus/utils/deep-merge.js'
import type { GetValue } from '@extractus/utils/get-value.js'

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

  type OptionsExtractors = Options['extractors']
  type SelectorExtractors = Options['selector']

  type ActualExtracted = undefined extends OptionsExtractors
    ? DefaultExtracted
    : DeepMerged<IterableElement<OptionsExtractors>>
  type ActualSelector = undefined extends SelectorExtractors ? typeof selector : SelectorExtractors
  type DefaultSelected = string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, unicorn/prevent-abbreviations
  type ActualSelected<T extends ValueOf<Selectors<unknown>>> = T extends (...args: any[]) => unknown
    ? Awaited<ReturnType<T>>
    : DefaultSelected
  return <
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, unicorn/prevent-abbreviations
      [K in keyof ActualExtracted]?: ActualExtracted[K] extends (...args: any[]) => unknown
        ? K extends keyof ActualSelector
          ? ActualSelected<GetValue<ActualSelector, K>>
          : DefaultSelected
        : {
            [SK in keyof ActualExtracted[K]]?: K extends keyof ActualSelector
              ? SK extends keyof ActualSelector[K]
                ? ActualSelected<GetValue<GetValue<ActualSelector, K>, SK>>
                : DefaultSelected
              : DefaultSelected
          }
    }
  >await pipeAsync(
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
    // pipeAsync max operators is 7
    (it) => debug('selected', it)
  )
}

// noinspection JSUnusedLocalSymbols
/**
 * For test the dynamic return type by input extractors
 */
// @ts-expect-error This function should be shaken off by esbuild
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function test() {
  const extractors = {
    title: async function* (input: string) {
      yield input
    },
    content: {
      text: async function* (input: string) {
        yield input
      },
      html: async function* (input: string) {
        yield input
      }
    }
  } as const

  const transformer = {
    title: (input: ExtractorReturn) => (isntAsyncIterable(input) ? toAsyncIterable(input) : input),
    content: {
      text: (input: ExtractorReturn) => (isntAsyncIterable(input) ? toAsyncIterable(input) : input),
      html: (input: ExtractorReturn) => (isntAsyncIterable(input) ? toAsyncIterable(input) : input)
    },
    nestTransformer: {
      test: (input: ExtractorReturn) => (isntAsyncIterable(input) ? toAsyncIterable(input) : input)
    },
    nestData: (input: ExtractorReturn) =>
      isntAsyncIterable(input) ? toAsyncIterable(input) : input
  } satisfies Transformers

  const selector = {
    title: (input: AsyncIterable<string>) =>
      <Promise<number>>pipeAsync(firstAsync(input), (it) => Number.parseInt(it!)),
    content: {
      text: (input: AsyncIterable<string>) => <Promise<string>>firstAsync(input)
    }
  } as const satisfies Selectors<unknown>

  const context = {
    url: 'https://example.com',
    language: 'en'
  } as const

  const input = ''
  const result = await extract(input, {
    extractors: [extractors],
    transformer,
    selector,
    ...context
  })
  type Result = {
    title?: number
    content?: {
      text?: string
      html?: string
    }
  }
  return result satisfies Result
}

// noinspection JSUnusedLocalSymbols
/**
 * For test the dynamic return type by input extractors
 */
// @ts-expect-error This function should be shaken off by esbuild
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function test() {
  const input = ''
  const result = await extract(input)
  type Result = {
    title?: string
    url?: string
    description?: string
    author?: {
      url?: string
      name?: string
    }
    image?: string
    language?: string
    date?: {
      published?: number
      modified?: number
    }
  }
  return result satisfies Result
}
