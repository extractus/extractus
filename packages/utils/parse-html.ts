import { pipe } from 'extra-utils'
import type sanitize from 'sanitize-html'
import memoize from './memoize.js'
import type { MinifyHtmlOptions } from './minify-html.js'
import minifyHtml from './minify-html.js'

export interface ParseHtmlOptions {
  sanitize: sanitize.IOptions
  minify: MinifyHtmlOptions
}

export default memoize(
  async (input: string, options?: ParseHtmlOptions) => {
    const html = pipe(
      input,
      // https://github.com/extractus/extractus/issues/8
      // () => minifyHtml(input, options?.minify),
      // () => sanitizeHtml(input, options?.sanitize)
      (input) => input
    )
    // const { Window } = await import('happy-dom')
    // if (Window) {
    //   const window = new Window()
    //   window.document.write(html)
    //   return <Document>(<unknown>window.document)
    // }
    const linkedom = await import('linkedom')
    const { DOMParser } = linkedom ?? globalThis
    if (DOMParser) {
      return <Document>(<unknown>new DOMParser().parseFromString(html, 'text/html'))
    }
    throw new Error("Can't find a usable html parser")
  },
  { maxSize: 2 }
)
