import type { DeepMerged } from '@extractus/utils/deep-merge.js'
import type { IterableElement } from 'type-fest'
import type { Extractor, Extractors } from '@extractus/extractus'

// Using `then` map to default for tuple type instead of union type
export const extractors = (<const>[
  // Using full path for esbuild compile
  await import('@extractus/schema-org-jsonld/index.js').then((it) => it.default),
  await import('@extractus/opengraph/index.js').then((it) => it.default),
  await import('@extractus/twitter-card/index.js').then((it) => it.default)
]) satisfies Iterable<Extractors>

export type DefaultExtractors = DeepMerged<IterableElement<typeof extractors>>

export type RequiredExtracted = {
  title: (input: string) => Extractor
  url: (input: string) => Extractor
}
