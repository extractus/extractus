import test from 'ava'
import extractor from './index.js'

test('should extract title', async (t) => {
  const result = extractor.title(
    `
        <html><head>
          <meta property='og:title' content='Hello World' />
        </head></html>`
  )
  t.is(result.next().value, 'Hello World')
  t.true(result.next().done)
})

test('should extract url', async (t) => {
  const result = extractor.url(
    `
        <html><head>
          <meta property='og:url' content='https://example.com' />
        </head></html>`
  )
  t.is(result.next().value, 'https://example.com')
  t.true(result.next().done)
})

test('should extract description', async (t) => {
  const result = extractor.description(
    `
        <html><head>
          <meta property='og:description' content='Hello World' />
        </head></html>`
  )
  t.is(result.next().value, 'Hello World')
  t.true(result.next().done)
})

test('should extract image', async (t) => {
  const result = extractor.image(
    `
        <html><head>
          <meta property='og:image' content='https://example.com/image1.jpg' />
          <meta property='og:image:url' content='https://example.com/image2.jpg' />
          <meta property='og:image:secure_url' content='https://example.com/image3.jpg' />
        </head></html>`
  )
  t.is(result.next().value, 'https://example.com/image3.jpg')
  t.is(result.next().value, 'https://example.com/image2.jpg')
  t.is(result.next().value, 'https://example.com/image1.jpg')
  t.true(result.next().done)
})

test('should extract language', async (t) => {
  const result = extractor.language(
    `
        <html><head>
          <meta property='og:locale' content='en_US' />
        </head></html>`
  )
  t.is(result.next().value, 'en_US')
  t.true(result.next().done)
})
