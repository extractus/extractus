/**
 * Based on https://github.com/fastify/deepmerge
 */
import type { BuiltIns } from './builtins.js'
import type { EmptyObject, ValueOf } from 'type-fest'
import type { KeysOfUnion } from 'type-fest/source/internal.js'
import type { GetValue } from './get-value.js'
import {
  concat,
  concatAsync,
  isAsyncIterable,
  isIterable
} from 'iterable-operator'
import { isArray, isObject } from 'extra-utils'

export declare type DeepMerged<T, Ignored = never> = [T] extends [unknown[]]
  ? {
      [K in KeysOfUnion<T>]: DeepMerged<T[K], Ignored>
    }
  : [T] extends [Ignored | BuiltIns]
  ? T
  : [T] extends [object]
  ? {
      [K in KeysOfUnion<T>]: DeepMerged<GetValue<T, K>, Ignored>
    }
  : T

const isPrototypeKey = (value: string) =>
  value === 'constructor' || value === 'prototype' || value === '__proto__'

const isMergeableObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !(value instanceof RegExp) &&
  !(value instanceof Date)

const clone = <T>(entry: T) =>
  isMergeableObject(entry)
    ? <T>(Array.isArray(entry) ? cloneArray(entry) : cloneObject(entry))
    : entry

function cloneArray<T>(value: T[]) {
  // eslint-disable-next-line unicorn/no-new-array
  const result = <Array<T | undefined>>new Array(value.length)
  // eslint-disable-next-line unicorn/no-for-loop
  for (let index = 0; index < value.length; ++index) {
    result[index] = clone(value[index])
  }
  return result
}

function cloneObject<T extends Record<string, unknown>>(target: T) {
  const result = <Record<string, unknown>>{}

  const targetKeys = Object.keys(target)
  for (const key of targetKeys) {
    if (!isPrototypeKey(key)) result[key] = clone(target[key])
  }
  return <T>result
}

function concatArrays<T, R>(source: T[], target: R[]) {
  return [...source, ...target]
}

const isBuiltIn = (value: unknown): value is BuiltIns =>
  !isObject(value) || value instanceof RegExp || value instanceof Date

function mergeObject<
  T extends Record<string, unknown>,
  R extends Record<string, unknown>
>(source: T, target: R) {
  const result = <Record<string, ValueOf<T> | ValueOf<R>>>{}
  const targetKeys = <Array<string & keyof T>>Object.keys(target)
  const sourceKeys = <Array<string & keyof R>>Object.keys(source)

  for (const key of sourceKeys) {
    if (!isPrototypeKey(key) && !targetKeys.includes(key)) {
      result[key] = clone(source[key])
    }
  }

  for (const key of targetKeys) {
    if (!isPrototypeKey(key)) {
      result[key] = <ValueOf<T> | ValueOf<R>>(
        (key in target && sourceKeys.includes(key)
          ? merge(source[key], target[key])
          : clone(target[key]))
      )
    }
  }
  return result
}

// function merge<T extends BuiltIns, R>(source: T, target: R): T
//
// function merge<T, R extends BuiltIns>(source: T, target: R): T
//
// function merge<T extends unknown[], R extends unknown[]>(
//   source: T,
//   target: R
// ): SpreadTupleOrArray<T, R>
//
// function merge<T extends Iterable<unknown>, R extends Iterable<unknown>>(
//   source: T,
//   target: R
// ): Iterable<IterableElement<T> | IterableElement<R>>
//
// function merge<
//   T extends AsyncIterable<unknown>,
//   R extends AsyncIterable<unknown>
// >(source: T, target: R): AsyncIterable<IterableElement<T> | IterableElement<R>>

function merge<T, R>(source: T, target: R): DeepMerged<T | R>

function merge<T, R>(source: T, target: R) {
  if (isBuiltIn(target)) {
    return clone(target)
  } else if (isArray(source) && isArray(target)) {
    return concatArrays(source, target)
  } else if (isIterable(source) && isIterable(target)) {
    return concat(source, target)
  } else if (isAsyncIterable(source) && isAsyncIterable(target)) {
    return concatAsync(source, target)
  } else {
    return mergeObject(<TypedRecord<T>>source, <TypedRecord<R>>target)
  }
}

type TypedRecord<T> = T extends Record<string, infer R>
  ? Record<string, R>
  : never

export function deepMerge(): EmptyObject
export function deepMerge<T>(source: T): T
export function deepMerge<T extends Record<PropertyKey, unknown> | unknown[]>(
  ...arguments_: T[]
): DeepMerged<T>

export function deepMerge<T extends Record<PropertyKey, unknown> | unknown[]>(
  ...arguments_: T[]
) {
  switch (arguments_.length) {
    case 0: {
      return {}
    }
    case 1: {
      return clone(arguments_[0])
    }
    case 2: {
      return merge(arguments_[0], arguments_[1])
    }
  }
  let result = <DeepMerged<T>>{}
  for (const argument of arguments_) {
    result = <DeepMerged<T>>merge(result, argument)
  }
  return result
}
