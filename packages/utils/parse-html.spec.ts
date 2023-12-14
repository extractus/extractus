import parseHtml from './parse-html.js'
import test from 'ava'

test('should parse html', function (t) {
  const result = parseHtml('<html><head><title>test</title></head><body></body></html>')
  t.is(result.querySelector('title')?.textContent, 'test')
})
