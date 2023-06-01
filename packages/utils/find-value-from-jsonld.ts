import { getValueByPath } from './get-value-by-path.js'
import type { Optional } from './optional.js'

export default function* <T extends Record<string, unknown>>(
  input: Optional<T>,
  path: string,
  ignored?: (it: unknown) => boolean
) {
  if (!input) return
  yield getValueByPath<string>(input, path, ignored)
  for (const value of getValueByPath<string[]>(
    input,
    `@graph.${path}`,
    ignored
  ) ?? []) {
    yield value
  }
}
