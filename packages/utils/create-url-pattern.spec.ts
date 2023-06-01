import test from 'ava'
import createUrlPattern from './create-url-pattern.js'

test('should create a url pattern', async (t) => {
  const pattern = createUrlPattern('*://example.com/*')
  // noinspection SuspiciousTypeOfGuard
  t.true(pattern instanceof URLPattern)
  t.true(pattern.test('https://example.com/foo'))
})
