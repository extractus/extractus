import type { ExtractorReturn, Transformer, TransformerReturn, Transformers } from './index.js'
import type { ExtractContext } from '@extractus/utils/extract-context.js'
import { isIterable, isntIterable, map, toArray } from 'iterable-operator'
import type { Optional } from '@extractus/utils/optional.js'
import { DEBUG } from './logger.js'
import type { ObjectEntries } from 'type-fest/source/entries.js'
import type { NestableRecord } from '@extractus/utils/nestable-record.js'

const applyTransformer = (transformer: Transformer, input: ExtractorReturn, context: ExtractContext) =>
  DEBUG ? toArray(transformer(input, context)) : transformer(input, context)

const usingTransformer =
  <TTransformers extends Transformers>(transformers: TTransformers, context: ExtractContext) =>
  <Input extends NestableRecord<ExtractorReturn>>(input: Input) =>
    <
      {
        [K in keyof Input]: Input[K] extends ExtractorReturn
          ? TransformerReturn
          : {
              [SK in keyof Input[K]]: TransformerReturn
            }
      }
    >Object.fromEntries(
      map(<ObjectEntries<Input>>Object.entries(input), ([key, values]) => {
        const transform = transformers[<string>key]
        const invalidTransformer = typeof transform !== 'object'

        if (isntIterable(values)) {
          return [key, <
              {
                [SK in keyof typeof values]: TransformerReturn
              }
            >Object.fromEntries(
              map(<ObjectEntries<typeof values>>Object.entries(values), ([subKey, subValue]) => {
                if (invalidTransformer) return [subKey, subValue]
                const subTransform = transform[<string>subKey]
                if (!subTransform) return [subKey, subValue]
                return [subKey, applyTransformer(subTransform, subValue, context)]
              })
            )]
        }

        if (invalidTransformer && transform && isIterable<Optional<string>>(values))
          return [key, applyTransformer(transform, values, context)]

        return [key, values]
      })
    )

// noinspection JSUnusedLocalSymbols
/**
 * For test the dynamic return type by input transformer
 */
// @ts-expect-error This function should be shaken off by esbuild
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test() {
  const transformer = {
    title: (input: ExtractorReturn) => input,
    content: {
      text: (input: ExtractorReturn) => input,
      html: (input: ExtractorReturn) => input
    }
  }
  const input = {
    title: ['data'],
    content: {
      text: ['data'],
      html: ['data']
    }
  }
  return usingTransformer(transformer, {})(input) satisfies {
    title: TransformerReturn
    content: {
      text: TransformerReturn
      html: TransformerReturn
    }
  }
}

export default usingTransformer
