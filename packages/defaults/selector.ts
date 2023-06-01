import { map, take } from 'iterable-operator'
import type { Selectors } from '@extractus/extractus'
import { pipe } from 'extra-utils'

/**
 * @package
 */
export const dateSelector = (input: Iterable<string>) =>
  pipe(
    input,
    (it) => map(it, (it) => Date.parse(it)),
    (it) => take(it, 1)
  )

export default {
  date: {
    published: dateSelector,
    modified: dateSelector
  }
} satisfies Selectors<unknown>
