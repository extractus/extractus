import test from 'ava'
import resolveUrl from './resolve-url.js'

test('should resolve relative urls', (t) => {
  t.is(resolveUrl('foo', 'https://example.com/'), 'https://example.com/foo')
})

test('should resolve absolute urls', (t) => {
  t.is(resolveUrl('/foo', 'https://example.com/bar'), 'https://example.com/foo')
})

test('should resolve protocol-relative urls', (t) => {
  t.is(resolveUrl('//example.com/foo', 'https://example.com/bar'), 'https://example.com/foo')
})

test('should resolve urls with base', (t) => {
  t.is(resolveUrl('foo', 'https://example.com/bar'), 'https://example.com/foo')
})