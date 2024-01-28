import type { Extractor, Extractors } from '@extractus/utils/extractus.js'
import type { GetValue } from '@extractus/utils/get-value.js'
import { mapAsync } from 'iterable-operator'
import type { IterableElement, KeysOfUnion } from 'type-fest'

export const extractors = mapAsync(
  <const>[
    // Using full path for esbuild compile
    import('@extractus/schema-org-jsonld/index.js'),
    import('@extractus/opengraph/index.js'),
    import('@extractus/twitter-card/index.js'),
    import('@extractus/meta-tags/index.js'),
    import('@extractus/link-tag/index.js'),
    import('@extractus/generic/index.js')
  ],
  (it) => it.default
) satisfies AsyncIterable<Extractors>

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
