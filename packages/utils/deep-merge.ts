/**
 * Based on https://github.com/fastify/deepmerge
 */
import type { EmptyObject, ValueOf } from 'type-fest'
import type { BuiltIns, KeysOfUnion, UnknownRecord } from 'type-fest/source/internal.js'
import type { GetValue } from './get-value.js'
import { concat, concatAsync, isAsyncIterable, isIterable } from 'iterable-operator'
import { isArray, isntDate, isntRegExp, isObject } from 'extra-utils'

type DefaultIgnore =
  | BuiltIns
  | ((...a: any[]) => any)

export declare type DeepMerged<T, Ignored = never> = [T] extends [unknown[]]
  ? {
      [K in keyof T]: DeepMerged<T[K], Ignored>
    }
  : [T] extends [Iterable<infer R>]
  ? Iterable<DeepMerged<R, Ignored>>
  : [T] extends [AsyncIterable<infer R>]
  ? AsyncIterable<DeepMerged<R, Ignored>>
  : [T] extends [Ignored | DefaultIgnore]
  ? T
  : [T] extends [UnknownRecord]
  ? {
      [K in KeysOfUnion<T>]: DeepMerged<GetValue<T, K>, Ignored>
    }
  : T

const isPrototypeKey = (value: PropertyKey) => value === 'constructor' || value === 'prototype' || value === '__proto__'

const isntBuiltIn = <T>(value: T): value is Exclude<T, BuiltIns> =>
  isObject(value) && isntRegExp(value) && isntDate(value)

const isBuiltIn = (value: unknown): value is BuiltIns => !isntBuiltIn(value)

type CloneableRecord = { [K in PropertyKey]: Cloneable }
type Cloneable = BuiltIns | Iterable<Cloneable> | Cloneable[] | CloneableRecord
type Cloned<T extends Cloneable, U = T> = U extends BuiltIns
  ? T
  : U extends Array<infer R extends Cloneable>
  ? Array<Cloned<R>>
  : U extends Iterable<infer R extends Cloneable>
  ? Iterable<Cloned<R>>
  : U extends { [K in infer Keys]: infer Values extends Cloneable }
  ? {
      [K in Keys]: Cloned<Values>
    }
  : never

const clone = <T extends Cloneable>(entry: T): Cloned<T> => {
  // string is Iterable. Should handle first
  if (isBuiltIn(entry)) return <Cloned<T>>entry
  if (isArray(entry)) return <Cloned<T>>cloneArray(entry)
  if (isIterable(entry)) return <Cloned<T>>cloneIterable(entry)
  return <Cloned<T>>cloneObject(<CloneableRecord>entry)
}

function cloneArray<T extends Cloneable>(value: T[]) {
  const result = Array.from<Cloned<T>>({ length: value.length })
  for (const [index, element] of value.entries()) {
    result[index] = clone(element)
  }

  return result satisfies Cloned<typeof value>
}

function cloneIterable<T extends Cloneable>(value: Iterable<T>) {
  const iterable = <Iterable<Cloned<T>>>(function* () {
    for (const item of value) yield clone(item)
  })()

  return iterable satisfies Cloned<typeof value>
}

function cloneObject<Keys extends PropertyKey, Values extends Cloneable>(target: Record<Keys, Values>) {
  const result = <Record<Keys, Cloned<Values>>>{}
  const targetKeys = <Keys[]>Object.keys(target)
  for (const key of targetKeys) {
    if (!isPrototypeKey(key)) result[key] = clone(target[key])
  }

  return <Cloned<typeof target>>result
}

function concatArrays<T extends unknown[], R extends unknown[]>(source: T, target: R) {
  return [...source, ...target]
}

function mergeObject<T extends CloneableRecord, R extends CloneableRecord>(source: T, target: R) {
  const result = <Record<PropertyKey, Cloned<ValueOf<T> | ValueOf<R>>>>{}
  const targetKeys = <Array<keyof T>>Object.keys(target)
  const sourceKeys = <Array<keyof R>>Object.keys(source)

  for (const key of sourceKeys) {
    if (!isPrototypeKey(key) && !targetKeys.includes(key)) {
      result[key] = clone(source[key])
    }
  }

  for (const key of targetKeys) {
    if (!isPrototypeKey(key)) {
      result[key] =
        key in target && sourceKeys.includes(key)
          ? <Cloned<ValueOf<T> | ValueOf<R>>>(<unknown>merge(source[key], target[key]))
          : clone(target[key])
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
    return mergeObject(<CloneableRecord>source, <CloneableRecord>target)
  }
}

export function deepMerge(): EmptyObject
export function deepMerge<T>(source: T): T
export function deepMerge<T>(...arguments_: T[]): DeepMerged<T>

export function deepMerge<T>(...arguments_: T[]) {
  switch (arguments_.length) {
    case 0: {
      return {}
    }
    case 1: {
      return clone(<Cloneable>arguments_[0])
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
