import type { Extractor, Extractors, GetValue } from '@extractus/utils'
import { mapAsync } from 'iterable-operator'
import type { IterableElement, KeysOfUnion } from 'type-fest'

export const extractors = mapAsync(
  <const>[
    import('@extractus/schema-org-jsonld'),
    import('@extractus/opengraph'),
    import('@extractus/twitter-card'),
    import('@extractus/meta-tags'),
    import('@extractus/link-tag'),
    import('@extractus/generic')
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
