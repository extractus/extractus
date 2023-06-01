/**
 * https://github.com/plotly/is-string-blank/blob/master/index.js
 */
export default function (input: unknown): input is string {
  if (typeof input !== 'string') return false
  for (let index = 0; index < input.length; index++) {
    const a = input.codePointAt(index)
    if (
      a !== undefined &&
      (a < 9 || a > 13) &&
      a !== 32 &&
      a !== 133 &&
      a !== 160 &&
      a !== 5760 &&
      a !== 6158 &&
      (a < 8192 || a > 8205) &&
      a !== 8232 &&
      a !== 8233 &&
      a !== 8239 &&
      a !== 8287 &&
      a !== 8288 &&
      a !== 12_288 &&
      a !== 65_279
    )
      return true
  }
  return false
}
