import { isAsyncIterable, toArrayAsync } from 'iterable-operator'
import type { KeysOfUnion } from 'type-fest'
import type { GetValue } from './get-value.js'
import type { NestableRecord } from './nestable-record.js'
import type { Optional } from './optional.js'

const nestedAsyncIterableToArray = async <
  Element extends Optional<unknown>,
  Input extends NestableRecord<Optional<AsyncIterable<Element>>>
>(
  input: Input
) => {
  const result = <
    {
      [K in KeysOfUnion<Input>]:
        | Optional<Element[]>
        | {
            [SK in KeysOfUnion<GetValue<Input, K>>]: Optional<Element[]>
          }
    }
  >{}
  for (const path in input) {
    const typedPath = <KeysOfUnion<Input>>(<unknown>path)
    const values = <GetValue<Input, typeof typedPath>>input[typedPath]
    if (!values) {
      result[typedPath] = undefined
      continue
    }
    if (isAsyncIterable(values)) {
      result[typedPath] = await toArrayAsync<Element>(values)
      continue
    }
    const subResult = <
      {
        [SK in KeysOfUnion<GetValue<Input, typeof typedPath>>]: Optional<Element[]>
      }
    >{}

    const nestedValues = <
      {
          [SK in KeysOfUnion<GetValue<Input, typeof typedPath>>]: Optional<Element[]>
      }
    >values
    for (const subPath in nestedValues) {
      const typedSubPath = <KeysOfUnion<GetValue<Input, typeof typedPath>>>(<unknown>subPath)
      const subValues = <GetValue<GetValue<Input, typeof typedPath>, typeof typedSubPath>>(
        nestedValues[typedSubPath]!
      )
      if (!subValues) {
        subResult[typedSubPath] = undefined
        continue
      }
      if (isAsyncIterable(subValues)) subResult[typedSubPath] = await toArrayAsync<Element>(subValues)
    }
    result[typedPath] = subResult
  }
  return <
    {
      [K in KeysOfUnion<Input>]: GetValue<Input, K> extends AsyncIterable<infer R>
        ? R[]
        : {
            [SK in KeysOfUnion<GetValue<Input, K>>]: GetValue<
              GetValue<Input, K>,
              SK
            > extends AsyncIterable<infer R>
              ? R[]
              : never
          }
    }
  >result
}

export default nestedAsyncIterableToArray
