import { getValueByPath } from './get-value-by-path.js'
import type { Optional } from './optional.js'

export default function* <T extends Record<string, unknown>>(
  input: Optional<T>,
  path: string,
  ignored?: (it: unknown) => boolean
) {
  if (!input) return
  yield getValueByPath<string>(input, path, ignored)
  const result = getValueByPath<string[]>(input, `@graph.${path}`, ignored)
  if (result) yield* result
}
