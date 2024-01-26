import type { IterableElement, KeysOfUnion } from 'type-fest'
import type { Extractor, Extractors } from '@extractus/extractus'
import { map } from 'iterable-operator'
import type { GetValue } from '@extractus/utils/get-value.js'

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

type DefaultExtractors = IterableElement<typeof extractors>

export type DefaultExtracted = {
  [K in KeysOfUnion<DefaultExtractors>]: GetValue<DefaultExtractors, K> extends Extractor
    ? Extractor
    : {
        [SK in KeysOfUnion<GetValue<DefaultExtractors, K>>]: Extractor
      }
}

export type RequiredExtracted = {
  title: Extractor
  url: Extractor
}
