import type { TransformerReturn } from './index.js'
import type { NestableRecord } from '@extractus/utils/nestable-record.js'
import { filterAsync, isAsyncIterable, toArrayAsync } from 'iterable-operator'
import { DEBUG } from './logger.js'
import type { IterableElement } from 'type-fest'

const applyFilter = async (input: TransformerReturn) =>
  DEBUG
    ? await toArrayAsync(filterAsync<string>(input, (it) => !!it))
    : filterAsync<string>(input, (it) => !!it)

type Filtered = AsyncIterable<string> | string[]

const filterUndefined = async <Input extends NestableRecord<TransformerReturn>>(input: Input) => {
  const result = <
    {
      [K in keyof Input]:
        | Filtered
        | {
            [SK in keyof Input[K]]: Filtered
          }
    }
  >{}
  for (const path in input) {
    const values = input[path]
    if (isAsyncIterable<IterableElement<TransformerReturn>>(values)) {
      if (values) result[path] = await applyFilter(values)
      continue
    }
    const subResult = <
      {
        [SK in keyof Input[typeof path]]: Filtered
      }
    >{}
    for (const subPath in values) {
      const subValues = values[subPath]
      if (subValues) subResult[subPath] = await applyFilter(subValues)
    }
    result[path] = subResult
  }
  return result
}

export default filterUndefined
