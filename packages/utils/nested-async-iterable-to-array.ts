import { isAsyncIterable, toArrayAsync } from 'iterable-operator'
import type { NestableRecord } from './nestable-record.js'
import type { Optional } from './optional.js'

const nestedAsyncIterableToArray = async <
  Input extends NestableRecord<Optional<AsyncIterable<Optional<unknown>>>>
>(
  input: Input
) => {
  const result = <
    {
      [K in keyof Input]:
        | Optional<Array<Optional<unknown>>>
        | {
            [SK in keyof Input[K]]: Optional<Array<Optional<unknown>>>
          }
    }
  >{}
  for (const path in input) {
    const values = input[path]
    if (!values) {
      result[path] = undefined
      continue
    }
    if (isAsyncIterable(values)) {
      result[path] = await toArrayAsync(values)
      continue
    }
    const subResult = <
      {
        [SK in keyof Input[typeof path]]: Optional<Array<Optional<unknown>>>
      }
    >{}
    for (const subPath in values) {
      const subValues = values[subPath]!
      if (!subValues) {
        subResult[<keyof Input[typeof path]>subPath] = undefined
        continue
      }
      if (isAsyncIterable(subValues))
        subResult[<keyof Input[typeof path]>subPath] = await toArrayAsync(subValues)
    }
    result[path] = subResult
  }
  return <
    {
      [K in keyof Input]: Input[K] extends AsyncIterable<infer R>
        ? R[]
        : {
            [SK in keyof Input[K]]: Input[K][SK] extends AsyncIterable<infer R> ? R[] : never
          }
    }
  >result
}

export default nestedAsyncIterableToArray
