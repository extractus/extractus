import { containsChinese, type ExtractContext } from '@extractus/utils'
import { Culture } from '@microsoft/recognizers-text-date-time'

export function guessLanguage(input: string, context?: ExtractContext) {
  if (containsChinese(input)) return Culture.Chinese
  const language = context?.language
  const mapped = Culture.mapToNearestLanguage(language ?? 'en-us')
  return mapped === language ? Culture.English : mapped
}
