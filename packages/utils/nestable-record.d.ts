export type NestableRecord<Type, Key extends string = string> = Record<Key, Type | Record<Key, Type>>
