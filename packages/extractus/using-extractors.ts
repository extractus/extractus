import { deepMergeAsync } from '@extractus/utils/deep-merge.js'
import type { ExtractContext } from '@extractus/utils/extract-context.js'
import type { Extractor, ExtractorReturn, Extractors } from '@extractus/utils/extractus.js'
import { isFunction } from 'extra-utils'
import { mapAsync } from 'iterable-operator'

type ApplyExtractorResult<TExtractor extends Extractors> = {
  [K in keyof TExtractor]: TExtractor[K] extends Extractor
    ? ExtractorReturn
    : {
        [SK in keyof TExtractor[K]]: ExtractorReturn
      }
}

async function applyExtractors<TExtractor extends Extractors>(
  input: string,
  extractors: TExtractor,
  context: ExtractContext
) {
  type Result = {
    [K in keyof TExtractor]:
      | {
          [SK in keyof TExtractor[K]]: ExtractorReturn
        }
      | ExtractorReturn
  }
  const result = <Result>{}
  for (const path in extractors) {
    const extractorOrNested = extractors[path]
    const isExtractor = isFunction(extractorOrNested)
    if (isExtractor) {
      result[path] = extractorOrNested(input, context)
      continue
    }
    const subResult = <
      {
        [K in keyof TExtractor[typeof path]]: ExtractorReturn
      }
    >{}
    for (const subPath in extractorOrNested) {
      const subExtractor = extractorOrNested[subPath]!
      subResult[subPath] = subExtractor(input, context)
    }
    result[path] = subResult
  }
  // We can't infer key from union value. So, just cast it.
  // https://discord.com/channels/508357248330760243/1131593500400554054/1131593500400554054
  return <ApplyExtractorResult<TExtractor>>result
}

const usingExtractors =
  <TExtractor extends Extractors>(
    inputExtractors: Iterable<TExtractor> | AsyncIterable<TExtractor>,
    context: ExtractContext
  ) =>
  async (input: string) => {
    const result = mapAsync(inputExtractors, async (extractors) =>
      applyExtractors(input, extractors, context)
    )

    return await deepMergeAsync(result)
  }

export default usingExtractors
