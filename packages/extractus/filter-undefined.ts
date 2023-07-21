import type { TransformerReturn } from './index.js'
import type { NestableRecord } from '@extractus/utils/nestable-record.js'
import { filter, isntIterable, map, toArray } from 'iterable-operator'
import type { ObjectEntries } from 'type-fest/source/entries.js'
import { DEBUG } from './logger.js'

const applyFilter = (input: TransformerReturn): Iterable<string> =>
  DEBUG ? toArray(filter<string>(input, (it) => !!it)) : filter<string>(input, (it) => !!it)

const filterUndefined = <Input extends NestableRecord<TransformerReturn>>(input: Input) => <
    {
      [K in keyof Input]: Input[K] extends TransformerReturn
        ? Iterable<string>
        : {
            [SK in keyof Input[K]]: Iterable<string>
          }
    }
  >Object.fromEntries(
    map(<ObjectEntries<Input>>Object.entries(input), ([key, values]) => {
      if (isntIterable(values)) {
        return [key, <
            {
              [SK in keyof typeof values]: Iterable<string>
            }
          >Object.fromEntries(map(<ObjectEntries<typeof values>>Object.entries(values), ([subKey, subValue]) => [subKey, applyFilter(subValue)]))]
      }

      return [key, applyFilter(<TransformerReturn>values)]
    })
  )

export default filterUndefined
