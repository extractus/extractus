import test from 'ava'
import { deepMerge } from './deep-merge.js'

test('should merge objects', (t) => {
  t.deepEqual(deepMerge({ a: 1 }, { b: 2 }), { a: 1, b: 2 })
  t.deepEqual(deepMerge({ a: 1 }, { a: 2 }), { a: 2 })
  t.deepEqual(deepMerge({ a: 1 }, { a: { b: 2 } }), { a: { b: 2 } })
  t.deepEqual(deepMerge({ a: 1, b: 1 }, { b: 2, c: 2 }), { a: 1, b: 2, c: 2 })
})

test('should merge arrays', (t) => {
  t.deepEqual(deepMerge([1], [2]), [1, 2])
  t.deepEqual(deepMerge([{ a: 1 }], [{ b: 2 }]), [{ a: 1 }, { b: 2 }])
})

test('should merge objects and arrays', (t) => {
  t.deepEqual(deepMerge({ a: [1] }, { a: [2] }), { a: [1, 2] })
  t.deepEqual(deepMerge({ a: [1] }, { a: [{ b: 2 }] }), { a: [1, { b: 2 }] })
  t.deepEqual(deepMerge({ a: [{ b: 1 }] }, { a: [2] }), { a: [{ b: 1 }, 2] })
  t.deepEqual(deepMerge({ a: [{ b: 1 }] }, { a: [{ b: 2 }] }), {
    a: [{ b: 1 }, { b: 2 }]
  })
})
