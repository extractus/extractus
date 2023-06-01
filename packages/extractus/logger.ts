import log from 'loglevel'
import chalk from 'chalk'
import logPrefix from 'loglevel-plugin-prefix'
import objectInspect from 'object-inspect'

export const DEBUG = Boolean(process?.env && process.env['DEBUG'])

if (DEBUG) {
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
      return `${chalk.gray(`[${timestamp}]`)} ${colors[
        <keyof typeof colors>level.toUpperCase()
      ](level)}`
    }
  })
  log.setLevel('debug')
}

let inspectExist = false
try {
  const inspect = await import('node:util').then((it) => it.inspect)
  inspectExist = true
  inspect.defaultOptions = {
    ...inspect.defaultOptions,
    depth: 3
  }
} catch {
  /* empty */
}

export { default } from 'loglevel'
export const debug =
  (prefix: string) =>
  <T>(it: T) => {
    if (DEBUG) {
      log.debug(prefix, inspectExist ? it : objectInspect(it, { indent: 2 }))
    }
    return it
  }
