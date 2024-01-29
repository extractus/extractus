import test from 'ava'
import parseHtml from './parse-html.js'

test('should parse html', async function (t) {
  const result = await parseHtml('<html><head><title>test</title></head><body></body></html>')
  t.is(result.querySelector('title')?.textContent, 'test')
})

test('should recover from cache', async function (t) {
  parseHtml.cache.keys.push(['test'])
  parseHtml.cache.values.push('fake dom')
  const result = await parseHtml('test')
  // @ts-expect-error The fake dom is string
  t.is(result, 'fake dom')
})
