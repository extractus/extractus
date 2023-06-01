export type NestableRecord<Type> = Record<string, Type | Record<string, Type>>
