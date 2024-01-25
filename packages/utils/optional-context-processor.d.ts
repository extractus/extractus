import type { Optional } from './optional'
import type { ExtractContext } from './extract-context'

export type OptionalContextProcessor<
  ValueType = string,
  Result = AsyncIterable<Optional<string>>
> = ((input: ValueType, context?: ExtractContext) => Result) | ((input: ValueType) => Result)
