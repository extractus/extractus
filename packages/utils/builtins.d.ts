import type { Primitive } from 'type-fest'

export declare type BuiltIns =
  | Primitive
  | Date
  | RegExp
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ((...a: any[]) => any)
  | Iterable
