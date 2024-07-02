import type { NestableRecord, Optional } from '@extractus/utils'
import { nestedArrayToAsyncIterable, nestedAsyncIterableToArray } from '@extractus/utils'
import chalk from 'chalk'
import log from 'loglevel'
import logPrefix from 'loglevel-plugin-prefix'
import objectInspect from 'object-inspect'

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
  E extends Optional<unknown>,
  T extends NestableRecord<AsyncIterable<E>>
>(
  prefix: string,
  it: T
) => {
  if (DEBUG) {
    const result = await nestedAsyncIterableToArray(it)
    await debug(prefix, result)
    return <T>(<unknown>await nestedArrayToAsyncIterable(result))
  }
  return it
}
