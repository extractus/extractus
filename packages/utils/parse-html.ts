import { pipeAsync } from 'extra-utils'
import type sanitize from 'sanitize-html'
import memoize from './memoize.js'
import type { MinifyHtmlOptions } from './minify-html.js'
import absoluteElements from './absolute-elements.js'

export interface ParseHtmlOptions {
  sanitize?: sanitize.IOptions
  minify?: MinifyHtmlOptions
}

export let defaultOptions: ParseHtmlOptions = {
  minify: {
    keep_html_and_head_opening_tags: true,
    ensure_spec_compliant_unquoted_attribute_values: true
  }
}

export default memoize(
  // @ts-expect-error Options not using, see below
  async (input: string, options: ParseHtmlOptions = defaultOptions) => {
    return pipeAsync(
      input,
      // https://github.com/extractus/extractus/issues/8
      // Minify html wasm is 1MB that is too large.
      // TODO Need provide a standalone version without minify or switching to another one.
      // But minify html is faster than any others since it's written in rust.
      // () => minifyHtml(input, options?.minify),
      // TODO Need write the default options
      // () => sanitizeHtml(input, options?.sanitize)
      async () => {
        const linkedom = await import('linkedom')
        const { DOMParser } = linkedom ?? globalThis
        if (DOMParser) {
          return <Document>(<unknown>new DOMParser().parseFromString(input, 'text/html'))
        }
        throw new Error("Can't find a usable html parser")
      },
      (it) => absoluteElements(it)
    )
    // const { Window } = await import('happy-dom')
    // if (Window) {
    //   const window = new Window()
    //   window.document.write(html)
    //   return <Document>(<unknown>window.document)
    // }
  },
  { maxSize: 2 }
)
