import type { Processed, Selector, Selectors } from './index.js'
import type { ExtractContext } from '@extractus/utils/extract-context.js'
import {
  count,
  first,
  isIterable,
  isntIterable,
  reduce
} from 'iterable-operator'
import type { NestableRecord } from '@extractus/utils/nestable-record.js'
import { pipe } from 'extra-utils'

const defaultSelector = (input: Iterable<string>) => <string>first(input)

export default function <T>(
  selectors: Selectors<T | string>,
  context: ExtractContext
) {
  return (input: NestableRecord<Iterable<string>>) =>
    pipe(Object.entries(input), (entries) =>
      reduce(
        entries,
        (accumulator, [key, values]) => {
          const select = selectors[key] ?? defaultSelector
          if (isntIterable(values)) {
            const invalidSelector = typeof select !== 'object'
            accumulator[key] = reduce(
              Object.entries(values),
              (accumulator, [subKey, subValues]) => {
                if (!count(subValues)) return accumulator
                if (invalidSelector) {
                  accumulator[subKey] = defaultSelector(subValues)
                  return accumulator
                }
                const subSelect = select[subKey] ?? defaultSelector
                accumulator[subKey] = subSelect(subValues, context)
                return accumulator
              },
              <Record<string, ReturnType<Selector<T | string>>>>{}
            )
            return accumulator
          }

          if (!count(values)) return accumulator
          if (typeof select !== 'object' && isIterable(values)) {
            accumulator[key] = select(values, context)
            return accumulator
          }

          accumulator[key] = defaultSelector(values)
          return accumulator
        },
        <Processed<Selector<T | string>>>{}
      )
    )
}
