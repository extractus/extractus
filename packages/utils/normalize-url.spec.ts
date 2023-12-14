import test from 'ava'
import normalizeUrl from './normalize-url.js'

test('should normalize url', (t) => {
  t.is(normalizeUrl('https://example.com:443/../foo?bar=baz'), 'https://example.com/foo?bar=baz')
})

test('should not remove www', (t) => {
  t.is(normalizeUrl('https://www.example.com'), 'https://www.example.com')
})

test('should not remove trailing slash', (t) => {
  t.is(normalizeUrl('https://example.com/foo/'), 'https://example.com/foo/')
})

test('should remove single slash', (t) => {
  t.is(normalizeUrl('https://example.com/'), 'https://example.com')
})
