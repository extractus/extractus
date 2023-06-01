import resolveUrl from './resolve-url.js'

export default function (document: HTMLDocument, base: string = document.baseURI) {
  if (!base) return document

  // eslint-disable-next-line unicorn/prefer-spread
  for (const element of Array.from(document.querySelectorAll('a'))) {
    const href = element.getAttribute('href')
    if (href) element.setAttribute('href', resolveUrl(href, base))
  }

  // eslint-disable-next-line unicorn/prefer-spread
  for (const element of Array.from(document.querySelectorAll('img'))) {
    const source = element.dataset['src'] ?? element.getAttribute('src')
    if (source) {
      element.setAttribute('src', resolveUrl(source, base))
      delete element.dataset['src']
    }
  }

  return document
}
