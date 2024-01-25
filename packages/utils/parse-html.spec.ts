import parseHtml from './parse-html.js'
import test from 'ava'

test('should parse html', async function (t) {
  const result = await parseHtml('<html><head><title>test</title></head><body></body></html>')
  t.is(result.querySelector('title')?.textContent, 'test')
})
