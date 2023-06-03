// eslint-disable-next-line import/default
import mpath from 'mpath'
import isDigitString from '@stdlib/assert-is-digit-string'
import type { Get } from 'type-fest'
import type { ParseNumber } from './parse-number.js'
import type { Optional } from './optional.js'
import { isArray, isntArray } from 'extra-utils'
import memoize from './memoize.js'

type Path = string | Array<string | number>

/**
 * @see https://github.com/mongoosejs/mpath/blob/2c9a79bd2b46412ad10549dd74e3cea6a4d9ba98/lib/index.js#L327
 */
function getPartsByPath(path: Path) {
  if (typeof path === 'string') {
    // eslint-disable-next-line import/no-named-as-default-member
    return mpath.stringToParts(path)
  }
  if (isArray(path)) {
    let index: number
    const length = path.length
    for (index = 0; index < length; ++index) {
      if (typeof path[index] !== 'string' && typeof path[index] !== 'number') {
        throw new TypeError(
          'Each segment of path to `set()` must be a string or number, got ' +
            typeof path[index]
        )
      }
    }
    return path
  }
  throw new TypeError('Invalid `path`. Must be either string or array')
}

/**
 * Get value from target object with the path.
 * @param target Target object to get value
 * @param path The path split by dot(.). Read more at https://www.npmjs.com/package/mpath
 * @param ignored If any object on the path is ignored. Function will return undefined
 */
export function getValueByPath(
  target: undefined | null,
  path: Path,
  ignored?: (it: unknown) => boolean
): undefined

export function getValueByPath<T extends unknown[], P extends string>(
  target: T,
  path: P,
  ignored?: (it: unknown) => boolean
): T[ParseNumber<P>]

export function getValueByPath<
  T extends Record<PropertyKey, unknown>,
  P extends string | string[]
>(target: T, path: P, ignored?: (it: unknown) => boolean): Get<T, P>

export function getValueByPath<T>(
  target: unknown,
  path: Path,
  ignored?: (it: unknown) => boolean
): Optional<T>

export function getValueByPath<T>(
  target: unknown,
  path: Path,
  ignored?: (it: unknown) => boolean
): Optional<T> {
  if (
    target === null ||
    target === undefined ||
    (isntArray(target) && ignored?.(target))
  )
    return
  const parts = getPartsByPath(path)
  if (parts.length === 0) return target as T
  if (
    isArray(target) &&
    !(isDigitString(parts[0]) || typeof parts[0] === 'number')
  ) {
    const length = target.length
    const result = Array.from({ length })
    for (let index = 0; index < length; index++) {
      if (ignored?.(target[index])) continue
      result[index] = target[index]
        ? getValueByPath<T>(target[index], parts, ignored)
        : undefined
    }
    return <T>result
  }
  // eslint-disable-next-line import/no-named-as-default-member,@typescript-eslint/no-non-null-assertion
  const nextTarget = mpath.get(parts[0]!.toString(), target)
  return getValueByPath<T>(nextTarget, parts.slice(1), ignored)
}

export default memoize(getValueByPath)
