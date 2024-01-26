import type { Selectors, TransformerReturn } from './index.js'
import type { ExtractContext } from '@extractus/utils/extract-context.js'
import { firstAsync, isAsyncIterable, toAsyncIterable } from 'iterable-operator'
import type { NestableRecord } from '@extractus/utils/nestable-record.js'
import type { IterableElement } from 'type-fest'
import { isFunction, isObject } from 'extra-utils'

const defaultSelector = (input: AsyncIterable<string>) => <Promise<string>>firstAsync(input)

function usingSelector<TSelectors extends Selectors<T>, T>(
  selectors: TSelectors,
  context: ExtractContext
) {
  return async <Input extends NestableRecord<TransformerReturn>>(input: Input) => {
    type Result = {
      [K in keyof Input]:
        | string
        | T
        | {
            [SK in keyof Input[K]]: string | T
          }
    }
    const result = <Result>{}
    for (const path in input) {
      const values = input[path]!
      const selector = selectors[<string>path] ?? defaultSelector
      const isSelector = isFunction(selector)
      if (isSelector && isAsyncIterable<IterableElement<TransformerReturn>>(values)) {
        result[path] = await selector(values, context)
        if (!result[path]) delete result[path]
        continue
      }
      if (isObject(values)) {
        const subResult = <
          {
            [K in keyof Input[typeof path]]: string | T
          }
        >{}

        for (const subPath in values) {
          const subValue = values[subPath]!
          const subSelector = isSelector ? undefined : selector[subPath]
          const actualSelector = subSelector ?? defaultSelector
          subResult[<keyof Input[typeof path]>subPath] = await actualSelector(subValue, context)
          if (!subResult[<keyof Input[typeof path]>subPath])
            delete subResult[<keyof Input[typeof path]>subPath]
        }

        result[path] = subResult
        continue
      }

      result[path] = await defaultSelector(values)
      if (!result[path]) delete result[path]
    }
    return <
      {
        [K in keyof Input]: Input[K] extends AsyncIterable<string>
          ? K extends keyof TSelectors
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              TSelectors[K] extends (...arguments_: any[]) => any
              ? Awaited<ReturnType<TSelectors[K]>>
              : string
            : string
          : {
              [SK in keyof Input[K]]: K extends keyof TSelectors
                ? SK extends keyof TSelectors[K]
                  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    TSelectors[K][SK] extends (...arguments_: any[]) => any
                    ? Awaited<ReturnType<TSelectors[K][SK]>>
                    : string
                  : string
                : string
            }
      }
    >result
  }
}

// noinspection JSUnusedLocalSymbols
/**
 * For test the dynamic return type by input selector
 */
// @ts-expect-error This function should be shaken off by esbuild
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function test() {
  const selector = {
    title: (input: AsyncIterable<string>) => <Promise<string>>firstAsync(input),
    content: {
      text: (input: AsyncIterable<string>) => <Promise<string>>firstAsync(input)
    }
  } as const satisfies Selectors<string>
  const input = {
    title: toAsyncIterable(['title']),
    content: {
      text: toAsyncIterable(['text'])
    }
  }
  type Result = {
    title: string
    content: {
      text: string
    }
  }
  const selectors = usingSelector(selector, {})
  const result = await selectors(input)
  return result satisfies Result
}

export default usingSelector
