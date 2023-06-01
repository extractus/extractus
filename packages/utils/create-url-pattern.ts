if (!('URLPattern' in globalThis)) {
  await import('urlpattern-polyfill')
}

export default (input: string) => new URLPattern(input)
