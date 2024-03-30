import type { DefaultExtracted } from '@extractus/defaults/extractors.js'
import { extractors } from '@extractus/defaults/extractors.js'
import selector from '@extractus/defaults/selector.js'
import transformer from '@extractus/defaults/transformer.js'
import type {
  DeepMerged,
  ExtractContext,
  Extractors,
  GetValue,
  Selectors,
  Transformers
} from '@extractus/utils'

import { pipeAsync } from 'extra-utils'
import type { IterableElement, SetNonNullable, Spread, ValueOf } from 'type-fest'
import filterUndefined from './filter-undefined.js'
import { debug, debugNestedIterable } from './logger.js'
import usingExtractors from './using-extractors.js'
import usingSelector from './using-selector.js'
import usingTransformer from './using-transformer.js'

export interface ExtractOptions<Selected> {
  url?: string
  language?: string
  // Disable for now
  // parse?: ParseHtmlOptions
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
    parse: {},
    ...options
  }
  await debug('options', actualOptions)
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
    async (it) => await debug('selected', it)
  )
}

/**
 * Since it's a memozied function you can inject cache into it.
 * So that you can specify {@link Document} object be used instead of parsing
 * @see https://github.com/extractus/extractus/blob/main/packages/utils/parse-html.ts
 * @see https://github.com/planttheidea/micro-memoize#memoizedcache
 */
export { parseHtml } from '@extractus/utils'
