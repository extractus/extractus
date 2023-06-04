import type { Extractor, Extractors, Processed } from './index.js'
import { map, reduce, toArray } from 'iterable-operator'
import type { ExtractContext } from '@extractus/utils/extract-context.js'
import { isObject, pipe } from 'extra-utils'
import { DEBUG } from './logger.js'
import { deepMerge } from '@extractus/utils/deep-merge.js'

export default <T extends Extractors>(extractors: Iterable<T>, context: ExtractContext) =>
  (input: string) =>
    pipe(
      input,
      () =>
        map(extractors, (extractors) =>
          reduce(
            Object.entries(extractors),
            (accumulator, [key, value]) => {
              accumulator[key] = isObject(value)
                ? reduce(
                    Object.entries(value),
                    (accumulator, [subKey, subValue]) => {
                      const result = subValue(input, context)
                      accumulator[subKey] = result
                      if (DEBUG) accumulator[subKey] = toArray(result)
                      return accumulator
                    },
                    <Record<string, ReturnType<Extractor>>>{}
                  )
                : (DEBUG
                ? toArray(value(input, context))
                : value(input, context))
              return accumulator
            },
            <Processed<Extractor>>{}
          )
        ),
      (it) => deepMerge(...it) satisfies Processed<Extractor>
    )
