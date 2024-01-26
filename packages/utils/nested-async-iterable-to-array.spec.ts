import test from 'ava'
import { toAsyncIterable } from 'iterable-operator'
import nestedAsyncIterableToArray from './nested-async-iterable-to-array.js'

test('should working', async (t) => {
  const input = {
    string: toAsyncIterable(['string']),
    undefined: undefined,
    nested: {
      string: toAsyncIterable(['nested string']),
      undefined: undefined
    }
  }
  t.deepEqual(await nestedAsyncIterableToArray(input), {
    string: ['string'],
    undefined: undefined,
    nested: {
      string: ['nested string'],
      undefined: undefined
    }
  })
})
