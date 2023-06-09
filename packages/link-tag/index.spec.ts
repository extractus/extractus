import test from 'ava'
import extractor from './index.js'

test('should extract url', async (t) => {
  const result = extractor.url(
    `
        <html><head>
          <link rel='alternate' href='https://alternate.com'>
          <link rel='canonical' href='https://canonical.com'>
        </head></html>`
  )
  t.is(result.next().value, 'https://canonical.com')
  t.is(result.next().value, 'https://alternate.com')
  t.true(result.next().done)
})
