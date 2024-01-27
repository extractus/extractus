import type { Selectors } from '@extractus/utils/extractus.js'
import { pipe } from 'extra-utils'
import { firstAsync, mapAsync } from 'iterable-operator'

/**
 * @package
 */
export const dateSelector = (input: AsyncIterable<string>) =>
  pipe(
    mapAsync(input, (it) => Date.parse(it)),
    firstAsync
  )

export default {
  date: {
    published: dateSelector,
    modified: dateSelector
  }
} satisfies Selectors<unknown>
