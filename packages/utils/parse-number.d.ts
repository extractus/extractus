export declare type ParseNumber<T extends string> =
  T extends `${infer N extends number}.0`
    ? N
    : T extends `${infer N extends number}.${infer Decimal}${0}`
    ? ParseNumber<`${N}.${Decimal}`>
    : T extends `${infer N extends number}`
    ? N
    : never