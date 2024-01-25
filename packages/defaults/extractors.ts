import type { DeepMerged } from '@extractus/utils/deep-merge.js'
import type { IterableElement } from 'type-fest'
import type { Extractor, Extractors } from '@extractus/extractus'
import { map } from 'iterable-operator'

export const extractors = map(
  <const>[
    // Using full path for esbuild compile
    await import('@extractus/schema-org-jsonld/index.js'),
    await import('@extractus/opengraph/index.js'),
    await import('@extractus/twitter-card/index.js'),
    await import('@extractus/meta-tags/index.js'),
    await import('@extractus/link-tag/index.js'),
    await import('@extractus/generic/index.js')
  ],
  (it) => it.default
) satisfies Iterable<Extractors>

export type DefaultExtractors = DeepMerged<IterableElement<typeof extractors>>

export type RequiredExtracted = {
  title: Extractor
  url: Extractor
}
