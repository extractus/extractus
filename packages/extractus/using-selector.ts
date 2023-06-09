import type { Processed, Selector, Selectors } from './index.js'
import type { ExtractContext } from '@extractus/utils/extract-context.js'
import { first, isIterable, isntIterable, reduce } from 'iterable-operator'
import type { NestableRecord } from '@extractus/utils/nestable-record.js'
import { pipe } from 'extra-utils'

const defaultSelector = (input: Iterable<string>) => <string>first(input)

export default function <T>(selectors: Selectors<T | string>, context: ExtractContext) {
  return (input: NestableRecord<Iterable<string>>) =>
    pipe(Object.entries(input), (entries) =>
      reduce(
        entries,
        (accumulator, [key, values]) => {
          const select = selectors[key] ?? defaultSelector
          if (isntIterable(values)) {
            const invalidSelector = typeof select !== 'object'
            const result = reduce(
              Object.entries(values),
              (accumulator, [subKey, subValues]) => {
                const subSelect = invalidSelector ? undefined : select[subKey]
                const actualSelect = invalidSelector || !subSelect ? defaultSelector : subSelect
                const result = actualSelect(subValues, context)
                if (result) accumulator[subKey] = result
                return accumulator
              },
              <Record<string, ReturnType<Selector<T | string>>>>{}
            )
            if (Object.keys(result).length > 0) accumulator[key] = result
            return accumulator
          }

          if (typeof select !== 'object' && isIterable(values)) {
            const result = select(values, context)
            if (result) accumulator[key] = result
            return accumulator
          }
          const result = defaultSelector(values)
          if (Object.keys(result).length > 0) accumulator[key] = result
          return accumulator
        },
        <Processed<Selector<T | string>>>{}
      )
    )
}
