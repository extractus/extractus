import memoize from './memoize.js'

const SEPARATORS = ['|', '-', '\\', '/', '>', '»', '·', '–'].map((it) => ` ${it} `)

export default memoize(
  function* (title: string) {
    const separatorIndex = SEPARATORS.map((it) => title.lastIndexOf(it)).find((it) => it !== -1)
    if (separatorIndex === undefined) {
      yield title
    } else {
      yield title.slice(0, separatorIndex)
      yield title.slice(separatorIndex + 3)
      yield title
    }
  },
  { maxSize: 8 }
)
