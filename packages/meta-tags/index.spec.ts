import test from 'ava'
import extractor from './index.js'

test('should extract description', async (t) => {
  const result = extractor.description(
    `
        <html><head>
            <meta name='description' content='Hello World'>
        </head></html>`
  )
  t.is(result.next().value, 'Hello World')
  t.true(result.next().done)
})

test('should extract author name', async (t) => {
  const result = extractor.author.name(
    `
        <html><head>
            <meta name='author' content='John Doe'>
        </head></html>`
  )
  t.is(result.next().value, 'John Doe')
  t.true(result.next().done)
})
