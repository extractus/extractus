import test from 'ava'
import attributeSelector from './index.js'
import parseHtml from "@extractus/utils/parse-html.js"

let document: HTMLDocument

test.beforeEach(() => {
  document = parseHtml('<html><body><p id="foo">Foo</p></body></html>')
})

test('should return p tag when selector is not end with ::text or ::attr', (t) => {
  t.deepEqual(attributeSelector(document, 'p'), [document.querySelector('p')])
})

test('should return text content when selector is end with ::text', (t) => {
  t.deepEqual(attributeSelector(document, 'p::text'), ['Foo'])
})

test('should return attribute value when selector is end with ::attr(name)', (t) => {
  t.deepEqual(attributeSelector(document, 'p::attr(id)'), ['foo'])
})

test('should return empty array when selector is end with ::attr(name) but attribute is not exist', (t) => {
  t.deepEqual(attributeSelector(document, 'p::attr(class)'), [])
})

test('should return empty array when selector is end with ::attr(name', (t) => {
  t.deepEqual(attributeSelector(document, 'p::attr(name'), [])
})

test('should return empty array when selector is end with ::attr(name))', (t) => {
  t.deepEqual(attributeSelector(document, 'p::attr(name))'), [])
})

test('should throw LackArgumentError when selector is end with ::attr()', (t) => {
  t.throws(() => attributeSelector(document, 'p::attr()'), {
    message: '"::attr" need an argument'
  })
})

test('should throw LackArgumentError when selector is end with ::attr', (t) => {
  t.throws(() => attributeSelector(document, 'p::attr'), {
    message: '"::attr" need an argument'
  })
})
