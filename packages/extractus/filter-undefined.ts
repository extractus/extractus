import type { NestableRecord, TransformerReturn } from '@extractus/utils'
import { filterAsync, isAsyncIterable } from 'iterable-operator'
import type { IterableElement } from 'type-fest'

const filterUndefined = async <Input extends NestableRecord<TransformerReturn>>(input: Input) => {
  const result = <
    {
      [K in keyof Input]:
        | AsyncIterable<string>
        | {
            [SK in keyof Input[K]]: AsyncIterable<string>
          }
    }
  >{}
  for (const path in input) {
    const values = input[path]
    if (isAsyncIterable<IterableElement<TransformerReturn>>(values)) {
      if (values) result[path] = filterAsync<string>(values, (it) => !!it)
      continue
    }
    const subResult = <
      {
        [SK in keyof Input[typeof path]]: AsyncIterable<string>
      }
    >{}
    for (const subPath in values) {
      const subValues = values[subPath]
      if (subValues) subResult[subPath] = filterAsync<string>(subValues, (it) => !!it)
    }
    result[path] = subResult
  }
  return result
}

export default filterUndefined
