import type {
  ExtractContext,
  Extractor,
  ExtractorReturn,
  Extractors,
  GetValue
} from '@extractus/utils'
import { deepMergeAsync } from '@extractus/utils'
import { isFunction } from 'extra-utils'
import { mapAsync } from 'iterable-operator'
import type { KeysOfUnion } from 'type-fest'

type ApplyExtractorResult<TExtractor extends Extractors> = {
  [K in KeysOfUnion<TExtractor>]: GetValue<TExtractor, K> extends Extractor
    ? ExtractorReturn
    : {
        [SK in KeysOfUnion<GetValue<TExtractor, K>>]: ExtractorReturn
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
    const result = mapAsync(inputExtractors, (extractors: TExtractor) =>
      applyExtractors(input, extractors, context)
    )

    const merged = await deepMergeAsync(result)

    // TS2590: Expression produces a union type that is too complex to represent.
    return <ApplyExtractorResult<TExtractor>>(<unknown>merged)
  }

export default usingExtractors
