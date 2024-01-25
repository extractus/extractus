import type sanitize from 'sanitize-html'
import type { MinifyHtmlOptions } from './minify-html.js'
import minifyHtml from './minify-html.js'
import memoize from './memoize.js'

export interface ParseHtmlOptions {
  sanitize: sanitize.IOptions
  minify: MinifyHtmlOptions
}

export default memoize(
  async (input: string, options?: ParseHtmlOptions) => {
    const html = minifyHtml(input, options?.minify)
    const { Window } = await import('happy-dom')
    if (Window) {
      const window = new Window()
      window.document.write(html)
      return <Document><unknown>window.document
    }
    if (globalThis.DOMParser) {
      return <Document>(<unknown>new globalThis.DOMParser().parseFromString(html, 'text/html'))
    }
    throw new Error("Can't find a usable html parser")
  },
  { maxSize: 2 }
)
