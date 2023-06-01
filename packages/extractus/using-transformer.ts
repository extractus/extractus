import type {
  Extractor,
  Processed,
  Transformer,
  Transformers
} from './index.js'
import type { ExtractContext } from '@extractus/utils/extract-context.js'
import { isIterable, isntIterable, reduce, toArray } from 'iterable-operator'
import type { NestableRecord } from '@extractus/utils/nestable-record.js'
import type { Optional } from '@extractus/utils/optional.js'
import { pipe } from 'extra-utils'
import { DEBUG } from './logger.js'

export default (transformers: Transformers, context: ExtractContext) =>
  (input: Processed<Extractor>) =>
    pipe(Object.entries(input), (entries) =>
      reduce(
        entries,
        (accumulator, [key, values]) => {
          const transform = transformers[key]
          const invalidTransformer = typeof transform !== 'object'

          if (isntIterable(values)) {
            accumulator[key] = reduce(
              Object.entries(values),
              (accumulator, [subKey, subValues]) => {
                if (invalidTransformer) {
                  accumulator[subKey] = subValues
                  return accumulator
                }
                const subTransform = transform[subKey]
                if (!subTransform) {
                  accumulator[subKey] = subValues
                  return accumulator
                }

                const result = subTransform(subValues, context)
                accumulator[subKey] = result
                if (DEBUG) accumulator[subKey] = toArray(result)
                return accumulator
              },
              <Record<string, ReturnType<Transformer>>>{}
            )
            return accumulator
          }

          if (
            invalidTransformer &&
            transform &&
            isIterable<Optional<string>>(values)
          ) {
            const result = transform(values, context)
            accumulator[key] = result
            if (DEBUG) accumulator[key] = toArray(result)
            return accumulator
          }

          accumulator[key] = values
          return accumulator
        },
        <NestableRecord<ReturnType<Transformer>>>{}
      )
    )
