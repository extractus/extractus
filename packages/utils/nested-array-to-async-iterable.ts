import { isIterable, toAsyncIterable } from 'iterable-operator'
import type { KeysOfUnion } from 'type-fest'
import type { GetValue } from './get-value.js'
import type { NestableRecord } from './nestable-record.js'
import type { Optional } from './optional.js'

const nestedArrayToAsyncIterable = async <
  Element extends Optional<unknown>,
  Input extends NestableRecord<Optional<Element[]>>
>(
  input: Input
) => {
  const result = <
    {
      [K in KeysOfUnion<Input>]:
        | AsyncIterable<Element>
        | {
            [SK in KeysOfUnion<GetValue<Input, K>>]: AsyncIterable<Element>
          }
    }
  >{}
  for (const path in input) {
    const typedPath = <KeysOfUnion<Input>>(<unknown>path)
    const values = input[typedPath]
    if (!values) {
      continue
    }
    if (isIterable(values)) {
      result[typedPath] = toAsyncIterable<Element>(values)
      continue
    }
    const subResult = <
      {
        [SK in KeysOfUnion<GetValue<Input, typeof typedPath>>]: AsyncIterable<Element>
      }
    >{}
    const nestedValues = <
      {
        [SK in KeysOfUnion<GetValue<Input, typeof typedPath>>]: Optional<AsyncIterable<Element>>
      }
    >values
    for (const subPath in nestedValues) {
      const typedSubPath = <KeysOfUnion<GetValue<Input, typeof typedPath>>>(<unknown>subPath)
      const subValues = <GetValue<GetValue<Input, typeof typedPath>, typeof typedSubPath>>(
        nestedValues[typedSubPath]!
      )
      if (!subValues) {
        continue
      }
      if (isIterable<Element>(subValues)) subResult[typedSubPath] = toAsyncIterable<Element>(subValues)
    }
    result[typedPath] = subResult
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
