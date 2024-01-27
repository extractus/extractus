import log from 'loglevel'
import chalk from 'chalk'
import logPrefix from 'loglevel-plugin-prefix'
import objectInspect from 'object-inspect'
import nestedAsyncIterableToArray from '@extractus/utils/nested-async-iterable-to-array.js'
import type { NestableRecord } from '@extractus/utils/nestable-record.js'
import nestedArrayToAsyncIterable from '@extractus/utils/nested-array-to-async-iterable.js'
import type { Optional } from '@extractus/utils/optional.js'

export const DEBUG = Boolean(process?.env?.['DEBUG'])

const colors = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.blue,
  WARN: chalk.yellow,
  ERROR: chalk.red
}
logPrefix.reg(log)
log.enableAll()

logPrefix.apply(log, {
  format(level, _, timestamp) {
    return `${chalk.gray(`[${timestamp}]`)} ${colors[<keyof typeof colors>level.toUpperCase()](level)}`
  }
})

if (DEBUG) log.setLevel('debug')

let inspectExist: boolean | undefined

async function findNodeInspect() {
  try {
    const { inspect } = await import('node:util')
    inspectExist = true
    inspect.defaultOptions = {
      ...inspect.defaultOptions,
      depth: 3
    }
  } catch {
    /* empty */
  }
}

export { default } from 'loglevel'
export const debug = async <T>(prefix: string, it: T) => {
  if (DEBUG) {
    if (inspectExist === undefined) await findNodeInspect()
    log.debug(prefix, inspectExist ? it : objectInspect(it, { indent: 2 }))
  }
  return it
}

export const debugNestedIterable = async <
  T extends NestableRecord<AsyncIterable<Optional<unknown>>>
>(
  prefix: string,
  it: T
) => {
  if (DEBUG) {
    const result = await nestedAsyncIterableToArray(it)
    await debug(prefix, result)
    return await nestedArrayToAsyncIterable(result)
  }
  return it
}
