import test from 'ava'
import splitTitle from './split-title.js'

test('should split title', (t) => {
  t.deepEqual([...splitTitle('foo | bar')], ['foo', 'bar', 'foo | bar'])
  t.deepEqual([...splitTitle('foo - bar')], ['foo', 'bar', 'foo - bar'])
  t.deepEqual([...splitTitle('foo \\ bar')], ['foo', 'bar', 'foo \\ bar'])
  t.deepEqual([...splitTitle('foo / bar')], ['foo', 'bar', 'foo / bar'])
  t.deepEqual([...splitTitle('foo > bar')], ['foo', 'bar', 'foo > bar'])
  t.deepEqual([...splitTitle('foo » bar')], ['foo', 'bar', 'foo » bar'])
  t.deepEqual([...splitTitle('foo · bar')], ['foo', 'bar', 'foo · bar'])
  t.deepEqual([...splitTitle('foo – bar')], ['foo', 'bar', 'foo – bar'])
})
