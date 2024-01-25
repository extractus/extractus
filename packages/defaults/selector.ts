import { firstAsync, mapAsync } from 'iterable-operator'
import type { Selectors } from '@extractus/extractus'
import { pipe } from 'extra-utils'

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
