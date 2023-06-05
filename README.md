## Installation

```shell
pnpm i @extractus/extractus
```

## Usage

#### Extract html with [default extractors, transformer, selector](packages/defaults)

```typescript
import { extract } from '@extractus/extractus'

extract(htmlString, options)
```

## Reference

### Extractor

Extract all strings from the html
Example: [packages/defaults/extractors.ts](packages/defaults/extractors.ts)

```typescript
type Extractor =
  | ((input: string, context?: ExtractContext) => string | undefined)
  | ((input: string) => string | undefined)
```

### Transformer

Transform the extracted strings. Such as normalize urls, filter blank strings
Example: [packages/defaults/transformer.ts](packages/defaults/transformer.ts)

```typescript
type Transformer =
  | ((input: Iterable<string | undefined>, context?: ExtractContext) => Iterable<string | undefined>)
  | ((input: Iterable<string | undefined>) => Iterable<string | undefined>)
```

### Selector

Select one value from transformed values. Such as the first title, string to date object
Example: [packages/defaults/selector.ts](packages/defaults/selector.ts)

```typescript
type Selector =
  | ((input: Iterable<string>, context?: ExtractContext) => T)
  | ((input: Iterable<string>) => T)
```

## Development

Using [pnpm](https://pnpm.io) for manage workspace

- Clone repo
- Open project in terminal or IDE
- Run `pnpm i` at the root of project

## Roadmap
https://github.com/orgs/extractus/projects/2/views/1
