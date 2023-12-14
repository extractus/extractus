import test from 'ava'
import minifyHtml from './minify-html.js'

test('should minify html', (t) => {
  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test</title>
        </head>
        <body>
          <div>
            <p>Test</p>
          </div>
        </body>
      </html>
    `
  t.is(minifyHtml(html), `<!doctypehtml><html><head><title>Test</title><body><div><p>Test</div>`)
})
