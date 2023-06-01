import test from 'ava'
import sanitizeHtml from './sanitize-html.js'

test('should remove script tags', (t) => {
  const html = '<script>alert("hello")</script>'
  t.is(sanitizeHtml(html), '')
})

test('should not remove script tags with type application/ld+json', (t) => {
  const html = '<script type="application/ld+json">alert("hello")</script>'
  t.is(sanitizeHtml(html), html)
})
