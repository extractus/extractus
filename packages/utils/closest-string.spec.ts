import closestString from './closest-string.js'
import test from 'ava'

test('should return the closest string', (t) => {
  t.deepEqual(closestString('foo', 'bar', 'baz', 'fooz'), {
    source: 'foo',
    result: 'fooz',
    distance: 1
  })
})

test('should return the first string when there are multiple strings with the same distance', (t) => {
  t.deepEqual(closestString('foo', 'baz', 'fooz', 'foor'), {
    source: 'foo',
    result: 'fooz',
    distance: 1
  })
})
