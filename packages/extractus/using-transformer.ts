import type {
  ExtractContext,
  ExtractorReturn,
  NestableRecord,
  TransformerReturn,
  Transformers
} from '@extractus/utils'
import { isFunction, isObject } from 'extra-utils'
import { isAsyncIterable } from 'iterable-operator'
import type { ValueOf } from 'type-fest'

const usingTransformer =
  <TTransformers extends Transformers>(transformers: TTransformers, context: ExtractContext) =>
  async <Input extends NestableRecord<ExtractorReturn>>(input: Input) => {
    type Result = {
      [K in keyof Input]:
        | {
            [SK in keyof Input[K]]: TransformerReturn
          }
        | TransformerReturn
    }
    const result = <Result>{}

    for (const path in input) {
      const transformerOrNested = transformers[path]!
      const isTransformer = isFunction(transformerOrNested)
      const values = input[path]

      if (isTransformer && isAsyncIterable<ValueOf<Input>>(values)) {
        result[path] = transformerOrNested(values, context)
        continue
      }
      if (isObject(values)) {
        type SubKeys = keyof Input[typeof path]
        const subResult = <
          {
            [K in SubKeys]: TransformerReturn
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
          subResult[<SubKeys>subPath] = subTransformer(subValue, context)
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

export default usingTransformer
