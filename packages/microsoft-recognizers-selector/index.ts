import { type ExtractContext, memoize, type Optional, type Selectors } from '@extractus/utils'
import type { DateTimeModelResult } from '@microsoft/recognizers-text-date-time'
import { Constants, Culture, recognizeDateTime } from '@microsoft/recognizers-text-date-time'
import dedupe from 'dedupe'
import { pipeAsync } from 'extra-utils'
import { firstAsync, mapAsync } from 'iterable-operator'
import { guessLanguage } from './guess-language.js'

/**
 * @param input milliseconds timestamp in string or number. Or readable date describing
 */
const parse = memoize((input: string, context?: ExtractContext): Date | undefined => {
  if (context?.language) context.language = Culture.mapToNearestLanguage(context.language)
  const results = recognizeDateTime(
    input,
    guessLanguage(input, context),
    undefined,
    // TODO Handle timezone from context?
    undefined,
    true
  )
  return resultToDate(<DateTimeModelResult[]>results)
})

const toDate = ({ typeName, resolution }: DateTimeModelResult) =>
  new Date(typeName.endsWith(`range`) ? resolution['values'][0].end : resolution['values'][0].value)

const resultToDate = memoize((results: DateTimeModelResult[]) => {
  results = dedupe(results, (it) => it.typeName)
  let accumulator = new Date()
  let success = false
  for (const result of results) {
    const date = toDate(result)
    if (result.typeName.includes(`.${Constants.SYS_DATETIME_DATETIME}`)) {
      accumulator = date
      success = true
    } else if (result.typeName.includes(`.${Constants.SYS_DATETIME_DATE}`)) {
      accumulator.setUTCFullYear(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
      success = true
    } else if (result.typeName.includes(`.${Constants.SYS_DATETIME_TIME}`)) {
      accumulator.setUTCHours(
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds()
      )
      success = true
    }
  }
  if (success) return Number.isNaN(accumulator.getTime()) ? undefined : accumulator
  return
})

function dateSelector(input: AsyncIterable<string>, context?: ExtractContext) {
  return pipeAsync(
    mapAsync(input, (it) => parse(it, context)?.getTime()),
    firstAsync
  )
}

export default {
  date: {
    published: dateSelector,
    modified: dateSelector
  }
} satisfies Selectors<Optional<number>>
