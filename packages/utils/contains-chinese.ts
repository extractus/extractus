import isChinese from 'is-chinese'

export default function (input: string) {
  for (const char of input) {
    if (isChinese(char)) return true
  }
  return false
}
