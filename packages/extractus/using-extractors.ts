import type { Extractor, ExtractorReturn, Extractors } from './index.js'
import { mapAsync, toArrayAsync } from 'iterable-operator'
import type { ExtractContext } from '@extractus/utils/extract-context.js'
import { isFunction } from 'extra-utils'
import { DEBUG } from './logger.js'
import { deepMergeAsync } from '@extractus/utils/deep-merge.js'
import type { IterableElement } from 'type-fest'

const applyExtractor = async (extractor: Extractor, input: string, context: ExtractContext) => {
  const extracted = extractor(input, context)
  if (DEBUG) {
    return await toArrayAsync(extracted)
  }
  return extracted
}

type ApplyExtractorResult<TExtractor extends Extractors> = {
  [K in keyof TExtractor]: TExtractor[K] extends Extractor
    ? ExtractorReturn
    : {
        [SK in keyof TExtractor[K]]: ExtractorReturn
      }
}

type UsingExtractorElement = ExtractorReturn | Array<IterableElement<ExtractorReturn>>

async function applyExtractors<TExtractor extends Extractors>(
  input: string,
  extractors: TExtractor,
  context: ExtractContext
) {
  type Result = {
    [K in keyof TExtractor]:
      | {
          [SK in keyof TExtractor[K]]: UsingExtractorElement
        }
      | UsingExtractorElement
  }
  const result = <Result>{}
  for (const path in extractors) {
    const extractorOrNested = extractors[path]
    const isExtractor = isFunction(extractorOrNested)
    if (isExtractor) {
      result[path] = await applyExtractor(extractorOrNested, input, context)
      continue
    }
    const subResult = <
      {
        [K in keyof TExtractor[typeof path]]: UsingExtractorElement
      }
    >{}
    for (const subPath in extractorOrNested) {
      const subExtractor = extractorOrNested[subPath]!
      subResult[subPath] = await applyExtractor(subExtractor, input, context)
    }
    result[path] = subResult
  }
  // We can't infer key from union value. So, just cast it.
  // https://discord.com/channels/508357248330760243/1131593500400554054/1131593500400554054
  return <ApplyExtractorResult<TExtractor>>result
}

export const usingExtractors =
  <TExtractor extends Extractors>(
    inputExtractors: Iterable<TExtractor> | AsyncIterable<TExtractor>,
    context: ExtractContext
  ) =>
  (input: string) => {
    const result = mapAsync(inputExtractors, async (extractors) =>
      applyExtractors(input, extractors, context)
    )
    return deepMergeAsync(result)
  }

export type UsingExtractorsReturn<TExtractor extends Extractors> = ReturnType<
  typeof usingExtractors<TExtractor>
>

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
  const context = {
    url: 'https://example.com',
    language: 'en'
  } as const
  const input = ''
  const result = await usingExtractors([extractors], context)(input)
  type Result = {
    title: ExtractorReturn
    content: {
      text: ExtractorReturn
      html: ExtractorReturn
    }
  }
  return result satisfies Result
}

export default usingExtractors
