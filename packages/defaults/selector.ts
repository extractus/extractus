import { first, map } from 'iterable-operator'
import type { Selectors } from '@extractus/extractus'
import { pipe } from 'extra-utils'

/**
 * @package
 */
export const dateSelector = (input: Iterable<string>) => pipe(input, (it) => map(it, (it) => Date.parse(it)), first)

export default {
  date: {
    published: dateSelector,
    modified: dateSelector
  }
} satisfies Selectors<unknown>
