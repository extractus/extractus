import type { ExtractContext } from './extract-context'
import type { Optional } from './optional'

export type OptionalContextProcessor<
  ValueType = string,
  Result = AsyncIterable<Optional<string>>
> = ((input: ValueType, context?: ExtractContext) => Result) | ((input: ValueType) => Result)
