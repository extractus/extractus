import type { NestableRecord } from './nestable-record.js'
import { isIterable, toAsyncIterable } from 'iterable-operator'

type Transformed = AsyncIterable<unknown>

const arrayResultToAsyncIterable = async <Input extends NestableRecord<unknown[]>>(
  input: Input
) => {
  const result = <
    {
      [K in keyof Input]:
        | Transformed
        | {
            [SK in keyof Input[K]]: Transformed
          }
    }
  >{}
  for (const path in input) {
    const values = input[path]
    if (isIterable(values)) {
      result[path] = toAsyncIterable(values)
      continue
    }
    const subResult = <
      {
        [SK in keyof Input[typeof path]]: Transformed
      }
    >{}
    for (const subPath in values) {
      const subValues = values[subPath]!
      subResult[subPath] = toAsyncIterable(subValues)
    }
    result[path] = subResult
  }
  return result
}

export default arrayResultToAsyncIterable
