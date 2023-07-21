import type { Selectors } from './index.js'
import type { ExtractContext } from '@extractus/utils/extract-context.js'
import { filter, first, isIterable, isntIterable, map } from 'iterable-operator'
import type { NestableRecord } from '@extractus/utils/nestable-record.js'
import type { ObjectEntries } from 'type-fest/source/entries.js'

const defaultSelector = (input: Iterable<string>) => <string>first(input)

function usingSelector<TSelectors extends Selectors<unknown>>(selectors: TSelectors, context: ExtractContext) {
  return <Input extends NestableRecord<Iterable<string>>>(input: Input) => <
      {
        [K in keyof Input]: Input[K] extends Iterable<string>
          ? K extends keyof TSelectors
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              TSelectors[K] extends (...arguments_: any[]) => any
              ? ReturnType<TSelectors[K]>
              : string
            : string
          : {
              [SK in keyof Input[K]]: K extends keyof TSelectors
                ? SK extends keyof TSelectors[K]
                  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    TSelectors[K][SK] extends (...arguments_: any[]) => any
                    ? ReturnType<TSelectors[K][SK]>
                    : string
                  : string
                : string
            }
      }
    >Object.fromEntries(
      filter(
        map(<ObjectEntries<typeof input>>Object.entries(input), ([key, values]) => {
          const select = selectors[<string>key] ?? defaultSelector
          if (isntIterable(values)) {
            const invalidSelector = typeof select !== 'object'
            const result = <
              {
                [SK in keyof typeof values]: SK extends keyof TSelectors
                  ? TSelectors[SK]
                  : ReturnType<typeof defaultSelector>
              }
            >Object.fromEntries(
              filter(
                map(<ObjectEntries<typeof values>>Object.entries(values), ([subKey, subValues]) => {
                  const subSelect = invalidSelector ? undefined : select[<string>subKey]
                  const actualSelect = invalidSelector ?? !subSelect ? defaultSelector : subSelect
                  const result = actualSelect(subValues, context)
                  if (result) return [subKey, result]
                  return []
                }),
                (it) => it.length > 0
              )
            )
            if (Object.keys(result).length > 0) return [key, result]
            return []
          }

          if (typeof select !== 'object' && isIterable(values)) {
            const result = select(values, context)
            if (result) return [key, result]
            return []
          }
          const result = defaultSelector(<Iterable<string>>values)
          if (Object.keys(result).length > 0) return [key, result]
          return []
        }),
        (it) => it.length > 0
      )
    )
}

// noinspection JSUnusedLocalSymbols
/**
 * For test the dynamic return type by input selector
 */
// @ts-expect-error This function should be shaken off by esbuild
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test() {
  const selector = {
    title: (input: Iterable<string>) => <string>first(input),
    content: {
      text: (input: Iterable<string>) => <string>first(input)
    }
  } as const satisfies Selectors<string>
  const input = {
    title: ['title'],
    content: {
      text: ['text']
    }
  }
  const selectors = usingSelector(selector, {})
  return selectors(input) satisfies {
    title: string
    content: {
      text: string
    }
  }
}

export default usingSelector
