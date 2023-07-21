import type { Extractor, ExtractorReturn, Extractors } from './index.js'
import { map, toArray } from 'iterable-operator'
import type { ExtractContext } from '@extractus/utils/extract-context.js'
import { isFunction, pipe } from 'extra-utils'
import { DEBUG } from './logger.js'
import { deepMerge } from '@extractus/utils/deep-merge.js'
import type { ObjectEntries } from 'type-fest/source/entries.js'

const applyExtractor = (extractor: Extractor, input: string, context: ExtractContext) =>
  DEBUG ? toArray(extractor(input, context)) : extractor(input, context)

const usingExtractors =
  <TExtractor extends Extractors>(inputExtractors: Iterable<TExtractor>, context: ExtractContext) =>
  (input: string) =>
    pipe(
      input,
      () =>
        map(
          inputExtractors,
          // We can't infer key from union value. So, just cast it.
          // https://discord.com/channels/508357248330760243/1131593500400554054/1131593500400554054
          (extractors) => <
              {
                [K in keyof TExtractor]: TExtractor[K] extends Extractor
                  ? ExtractorReturn
                  : {
                      [SK in keyof TExtractor[K]]: ExtractorReturn
                    }
              }
            >Object.fromEntries(
              map(Object.entries(extractors), ([key, value]) => {
                if (isFunction(value)) return [key, applyExtractor(value, input, context)]
                return [key, <Record<keyof typeof value, ExtractorReturn>>Object.fromEntries(
                    map(<ObjectEntries<typeof value>>Object.entries(value), ([subKey, subValue]) => {
                      return [subKey, applyExtractor(subValue, input, context)]
                    })
                  )]
              })
            )
        ),
      (it) => deepMerge(...it)
    )

// noinspection JSUnusedLocalSymbols
/**
 * For test the dynamic return type by input extractors
 */
// @ts-expect-error This function should be shaken off by esbuild
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test() {
  const extractors = {
    title: (input: string) => input,
    content: {
      text: (input: string) => input,
      html: (input: string) => input
    }
  } as const
  const context = {
    url: 'https://example.com',
    language: 'en'
  } as const
  const input = 'data'
  return usingExtractors([extractors], context)(input) satisfies {
    title: ExtractorReturn
    content: {
      text: ExtractorReturn
      html: ExtractorReturn
    }
  }
}

export default usingExtractors
