import { isIterable, toAsyncIterable } from 'iterable-operator'
import type { NestableRecord } from './nestable-record.js'
import type { Optional } from './optional.js'

const nestedArrayToAsyncIterable = async <
  Input extends NestableRecord<Optional<Array<Optional<unknown>>>>
>(
  input: Input
) => {
  const result = <
    {
      [K in keyof Input]:
        | AsyncIterable<Optional<unknown>>
        | {
            [SK in keyof Input[K]]: AsyncIterable<Optional<unknown>>
          }
    }
  >{}
  for (const path in input) {
    const values = input[path]
    if (!values) {
      continue
    }
    if (isIterable(values)) {
      result[path] = toAsyncIterable(values)
      continue
    }
    const subResult = <
      {
        [SK in keyof typeof values]: AsyncIterable<Optional<unknown>>
      }
    >{}
    for (const subPath in values) {
      const subValues = values[subPath]
      if (!subValues) {
        continue
      }
      if (isIterable(subValues))
        subResult[<keyof Input[typeof path]>subPath] = toAsyncIterable(subValues)
    }
    result[path] = subResult
  }
  return <
    {
      [K in keyof Input]: Input[K] extends Array<infer R>
        ? AsyncIterable<R>
        : {
            [SK in keyof Input[K]]: Input[K][SK] extends Array<infer R> ? AsyncIterable<R> : never
          }
    }
  >result
}

export default nestedArrayToAsyncIterable
