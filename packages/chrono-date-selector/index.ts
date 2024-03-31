import { type ExtractContext, type Optional, type Selectors } from '@extractus/utils'
import { pipeAsync } from 'extra-utils'
import { firstAsync, mapAsync } from 'iterable-operator'
import { guessLanguage } from './guess-language.js'

function chronoDateSelector(input: AsyncIterable<string>, context?: ExtractContext) {
  return pipeAsync(
    mapAsync(input, (it) => guessLanguage(it, context).parseDate(it)?.getTime()),
    firstAsync
  )
}

export default {
  date: {
    published: chronoDateSelector,
    modified: chronoDateSelector
  }
} satisfies Selectors<Optional<number>>
