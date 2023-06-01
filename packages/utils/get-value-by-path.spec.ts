import test from 'ava'
import { getValueByPath } from './get-value-by-path.js'

test('should return the value of array', (t) => {
  const target = <const>[1, 2, 3]
  const path = '0'
  const result = getValueByPath(target, path)
  t.is(result, 1)
})

test('should return the value of object', (t) => {
  const target = <const>{ a: 1, b: 2, c: 3 }
  const path = 'a'
  const result = getValueByPath(target, path)
  t.is(result, 1)
})

test('should return the value of nested object', (t) => {
  const target = <const>{ a: 1, b: { c: 2, d: 3 } }
  const path = 'b.c'
  const result = getValueByPath(target, path)
  t.is(result, 2)
})

test('should return the value of nested array', (t) => {
  const target = <const>{ a: 1, b: [2, 3] }
  const path = 'b.0'
  const result = getValueByPath(target, path)
  t.is(result, 2)
})

test('should throw TypeError when path contains non string or number', (t) => {
  const target = <const>{ a: 1, b: [2, 3] }
  const path = ['b', {}]
  // @ts-expect-error Test for wrong parameter
  const error = t.throws(() => getValueByPath(target, path))
  t.is(
    error?.message,
    'Each segment of path to `set()` must be a string or number, got object'
  )
})

test('should return undefined when target is undefined', (t) => {
  const target = undefined
  const path = 'a'
  const result = getValueByPath(target, path)
  t.is(result, undefined)
})