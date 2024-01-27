import test from 'ava'
import absoluteElements from './absolute-elements.js'
import parseHtml from './parse-html.js'

test('should absolute href when target is a tag', async (t) => {
  const document = await parseHtml(`
      <html>
        <head>
          <base href='https://example.com/'>
        </head>
        <body>
          <a href='/foo'>Foo</a>
          <a href='bar'>Bar</a>
        </body>
      </html>`)
  absoluteElements(document)
  t.is(document.querySelector('a')?.getAttribute('href'), 'https://example.com/foo')
  t.is(document.querySelectorAll('a')[1]?.getAttribute('href'), 'https://example.com/bar')
})

test('should absolute src when target is a img tag', async (t) => {
  const document = await parseHtml(`
      <html>
        <head>
          <base href='https://example.com/'>
        </head>
        <body>
          <img src='/foo'>
          <img src='bar'>
        </body>
      </html>`)
  absoluteElements(document)
  t.is(document.querySelector('img')?.getAttribute('src'), 'https://example.com/foo')
  t.is(document.querySelectorAll('img')[1]?.getAttribute('src'), 'https://example.com/bar')
})

test('should absolute data-src when target is a img tag', async (t) => {
  const document = await parseHtml(`
      <html>
        <head>
          <base href='https://example.com/'>
        </head>
        <body>
          <img data-src='/foo'>
          <img data-src='bar'>
        </body>
      </html>`)
  absoluteElements(document)
  t.is(document.querySelector('img')?.getAttribute('src'), 'https://example.com/foo')
  t.is(document.querySelectorAll('img')[1]?.getAttribute('src'), 'https://example.com/bar')
})

test('should prefer data-src over src when target is a img tag', async (t) => {
  const document = await parseHtml(`
      <html>
        <head>
          <base href='https://example.com/'>
        </head>
        <body>
          <img src='/foo' data-src='bar'>
        </body>
      </html>`)
  absoluteElements(document)
  t.is(document.querySelector('img')?.getAttribute('src'), 'https://example.com/bar')
})
