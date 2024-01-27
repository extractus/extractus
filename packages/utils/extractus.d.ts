import type { NestableRecord } from './nestable-record.js'
import type { OptionalContextProcessor } from './optional-context-processor.js'

export type Extractor = OptionalContextProcessor
export type Extractors = NestableRecord<Extractor>
export type ExtractorReturn = ReturnType<Extractor>
export type Transformer = OptionalContextProcessor<ExtractorReturn>
export type Transformers = NestableRecord<Transformer>
export type TransformerReturn = ReturnType<Transformer>
export type Selector<T> = OptionalContextProcessor<AsyncIterable<string>, Promise<T>>
export type Selectors<T> = NestableRecord<Selector<T>>
