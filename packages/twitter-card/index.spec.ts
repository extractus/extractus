/* eslint-disable unicorn/no-await-expression-member */
import test from 'ava'
import extractor from './index.js'

test('should extract title', async (t) => {
  const result = extractor.title(
    `
        <html><head>
          <meta property='twitter:title' content='Hello World' />
        </head></html>`
  )
  t.is((await result.next()).value, 'Hello World')
  t.true((await result.next()).done)
})

test('should extract url', async (t) => {
  const result = extractor.url(
    `
        <html><head>
          <meta property='twitter:url' content='https://example.com' />
        </head></html>`
  )
  t.is((await result.next()).value, 'https://example.com')
  t.true((await result.next()).done)
})

test('should extract description', async (t) => {
  const result = extractor.description(
    `
        <html><head>
          <meta property='twitter:description' content='Hello World' />
        </head></html>`
  )
  t.is((await result.next()).value, 'Hello World')
  t.true((await result.next()).done)
})

test('should extract image', async (t) => {
  const result = extractor.image(
    `
        <html><head>
          <meta property='twitter:image' content='https://example.com/image.png' />
        </head></html>`
  )
  t.is((await result.next()).value, 'https://example.com/image.png')
  t.true((await result.next()).done)
})
