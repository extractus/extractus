import type { Selectors } from '@extractus/utils'
import { pipe } from 'extra-utils'
import { firstAsync, mapAsync } from 'iterable-operator'

/**
 * @package
 */
export const simpleDateSelector = (input: AsyncIterable<string>) =>
  pipe(
    mapAsync(input, (it) => Date.parse(it)),
    firstAsync
  )

export default {
  date: {
    published: simpleDateSelector,
    modified: simpleDateSelector
  }
} satisfies Selectors<unknown>
