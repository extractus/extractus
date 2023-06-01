import splitTitle from './split-title.js'
import test from 'ava'

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
