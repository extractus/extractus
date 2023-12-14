import { DOMParser } from 'linkedom'
import type sanitize from 'sanitize-html'
import type { MinifyHtmlOptions } from './minify-html.js'
import minifyHtml from './minify-html.js'
import memoize from './memoize.js'

export interface ParseHtmlOptions {
  sanitize: sanitize.IOptions
  minify: MinifyHtmlOptions
}

export default memoize(
  (input: string, options?: ParseHtmlOptions) =>
    <HTMLDocument>(<unknown>new DOMParser().parseFromString(minifyHtml(input, options?.minify), 'text/html')),
  { maxSize: 2 }
)
