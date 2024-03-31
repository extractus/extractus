// https://r12a.github.io/app-subtags/
import { containsChinese, type ExtractContext } from '@extractus/utils'
import * as chrono from 'chrono-node'

export function guessLanguage(input: string, context?: ExtractContext): chrono.Chrono {
  const language = context?.language ?? 'en'
  if (language === 'hant' || language?.includes('hant') || language?.includes('Hant'))
    return chrono.zh.hant
  if (language?.startsWith('zh') || language === 'hans') return chrono.zh.hans.casual
  if (containsChinese(input)) return chrono.zh.hans.casual
  return language in chrono
    ? // @ts-expect-error
      chrono[language]?.casual ?? chrono.en.casual
    : chrono.en.casual
}
