import type { ExtractorReturn, Transformer, TransformerReturn, Transformers } from './index.js'
import type { ExtractContext } from '@extractus/utils/extract-context.js'
import {
  isAsyncIterable,
  isntAsyncIterable,
  toArrayAsync,
  toAsyncIterable
} from 'iterable-operator'
import { DEBUG } from './logger.js'
import type { IterableElement, ValueOf } from 'type-fest'
import { isFunction, isObject } from 'extra-utils'
import type { NestableRecord } from '@extractus/utils/nestable-record.js'

const applyTransformer = async (
  transformer: Transformer,
  input: ExtractorReturn,
  context: ExtractContext
) => {
  const transformed = transformer(input, context)
  if (DEBUG) {
    return await toArrayAsync(transformed)
  }
  return transformed
}

type UsingTransformerElement = TransformerReturn | Array<IterableElement<TransformerReturn>>

const usingTransformer =
  <TTransformers extends Transformers>(transformers: TTransformers, context: ExtractContext) =>
  async <Input extends NestableRecord<ExtractorReturn>>(input: Input) => {
    type Result = {
      [K in keyof Input]:
        | {
            [SK in keyof Input[K]]: UsingTransformerElement
          }
        | UsingTransformerElement
    }
    const result = <Result>{}

    for (const path in input) {
      const transformerOrNested = transformers[path]!
      const isTransformer = isFunction(transformerOrNested)
      const values = input[path]

      if (isTransformer && isAsyncIterable<ValueOf<Input>>(values)) {
        result[path] = await applyTransformer(transformerOrNested, values, context)
        continue
      }
      if (isObject(values)) {
        type SubKeys = keyof Input[typeof path]
        const subResult = <
          {
            [K in SubKeys]: UsingTransformerElement
          }
        >{}
        for (const subPath in values) {
          const subValue = values[subPath]!
          if (isTransformer) {
            subResult[<SubKeys>subPath] = subValue
            continue
          }
          const subTransformer = transformerOrNested[subPath]
          if (!subTransformer) {
            subResult[<SubKeys>subPath] = subValue
            continue
          }
          subResult[<SubKeys>subPath] = await applyTransformer(subTransformer, subValue, context)
        }
        result[path] = subResult
        continue
      }

      result[path] = <ExtractorReturn>values
    }
    return <
      {
        [K in keyof Input]: Input[K] extends ExtractorReturn
          ? ExtractorReturn
          : {
              [SK in keyof Input[K]]: ExtractorReturn
            }
      }
    >result
  }

// noinspection JSUnusedLocalSymbols
/**
 * For test the dynamic return type by input transformer
 */
// @ts-expect-error This function should be shaken off by esbuild
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function test() {
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
  const input = {
    title: toAsyncIterable(['data']),
    content: {
      text: toAsyncIterable(['data']),
      html: toAsyncIterable(['data'])
    },
    nestTransformer: toAsyncIterable(['data']),
    nestData: {
      test: toAsyncIterable(['data'])
    }
  }
  const result = await usingTransformer(transformer, {})(input)
  type Result = {
    title: UsingTransformerElement
    content: {
      text: UsingTransformerElement
      html: UsingTransformerElement
    }
    nestTransformer: UsingTransformerElement
    nestData: {
      test: UsingTransformerElement
    }
  }
  return result satisfies Result
}

export default usingTransformer
