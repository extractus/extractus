import type {
  ExtractorReturn,
  Selectors,
  TransformerReturn,
  Transformers
} from '@extractus/utils/extractus.js'
import test from 'ava'
import { pipeAsync } from 'extra-utils'
import { firstAsync, isntAsyncIterable, toAsyncIterable } from 'iterable-operator'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as url from 'node:url'
import { extract } from './index.js'
import usingExtractors from './using-extractors.js'
import usingSelector from './using-selector.js'
import usingTransformer from './using-transformer.js'

test('should extract from html', async (t) => {
  const html = await fs.readFile(
    path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), 'test/meta-test.html'),
    { encoding: 'utf8' }
  )
  const result = await extract(html)
  t.deepEqual(result, {
    author: {
      name: 'jsonld',
      url: 'https://jsonld.com'
    },
    title: 'jsonld',
    url: 'https://og.com'
  })
})

/**
 * Type testing
 */

// noinspection JSUnusedLocalSymbols
// @ts-expect-error This function is for type
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function testWithOptions() {
  const extractors = {
    title: async function* (input: string) {
      yield input
    },
    content: {
      text: async function* (input: string) {
        yield input
      },
      html: async function* (input: string) {
        yield input
      }
    }
  } as const

  const transformer = {
    title: (input: ExtractorReturn) => (isntAsyncIterable(input) ? toAsyncIterable(input) : input),
    content: {
      text: (input: ExtractorReturn) => (isntAsyncIterable(input) ? toAsyncIterable(input) : input),
      html: (input: ExtractorReturn) => (isntAsyncIterable(input) ? toAsyncIterable(input) : input)
    },
    nestTransformer: {
      test: (input: ExtractorReturn) => (isntAsyncIterable(input) ? toAsyncIterable(input) : input)
    },
    nestData: (input: ExtractorReturn) =>
      isntAsyncIterable(input) ? toAsyncIterable(input) : input
  } satisfies Transformers

  const selector = {
    title: (input: AsyncIterable<string>) =>
      <Promise<number>>pipeAsync(firstAsync(input), (it) => Number.parseInt(it!)),
    content: {
      text: (input: AsyncIterable<string>) => <Promise<string>>firstAsync(input)
    }
  } as const satisfies Selectors<unknown>

  const context = {
    url: 'https://example.com',
    language: 'en'
  } as const

  const input = ''
  const result = await extract(input, {
    extractors: [extractors],
    transformer,
    selector,
    ...context
  })
  type Result = {
    title?: number
    content?: {
      text?: string
      html?: string
    }
  }
  return result satisfies Result
}

// noinspection JSUnusedLocalSymbols
// @ts-expect-error This function is for type
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function testWithoutOptions() {
  const input = ''
  const result = await extract(input)
  type Result = {
    title?: string
    url?: string
    description?: string
    author?: {
      url?: string
      name?: string
    }
    image?: string
    language?: string
    date?: {
      published?: number
      modified?: number
    }
  }
  return result satisfies Result
}

// noinspection JSUnusedLocalSymbols
/**
 * For test the dynamic return type by input extractors
 */
// @ts-expect-error This function should be shaken off by esbuild
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function testUsingExtractors() {
  const extractors = {
    title: async function* (input: string) {
      yield input
    },
    content: {
      text: async function* (input: string) {
        yield input
      },
      html: async function* (input: string) {
        yield input
      }
    }
  } as const
  const context = {
    url: 'https://example.com',
    language: 'en'
  } as const
  const input = ''
  const result = await usingExtractors([extractors], context)(input)
  type Result = {
    title: ExtractorReturn
    content: {
      text: ExtractorReturn
      html: ExtractorReturn
    }
  }
  return result satisfies Result
}

// noinspection JSUnusedLocalSymbols
/**
 * For test the dynamic return type by input transformer
 */
// @ts-expect-error This function should be shaken off by esbuild
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function testUsingTransformer() {
  const transformer = {
    title: (input: ExtractorReturn) => (isntAsyncIterable(input) ? toAsyncIterable(input) : input),
    content: {
      text: (input: ExtractorReturn) => (isntAsyncIterable(input) ? toAsyncIterable(input) : input),
      html: (input: ExtractorReturn) => (isntAsyncIterable(input) ? toAsyncIterable(input) : input)
    },
    nestTransformer: {
      test: (input: ExtractorReturn) => (isntAsyncIterable(input) ? toAsyncIterable(input) : input)
    },
    nestData: (input: ExtractorReturn) =>
      isntAsyncIterable(input) ? toAsyncIterable(input) : input
  } satisfies Transformers
  const input = {
    title: toAsyncIterable(['data']),
    content: {
      text: toAsyncIterable(['data']),
      html: toAsyncIterable(['data'])
    },
    nestTransformer: toAsyncIterable(['data']),
    nestData: {
      test: toAsyncIterable(['data'])
    }
  }
  const result = await usingTransformer(transformer, {})(input)
  type Result = {
    title: TransformerReturn
    content: {
      text: TransformerReturn
      html: TransformerReturn
    }
    nestTransformer: TransformerReturn
    nestData: {
      test: TransformerReturn
    }
  }
  return result satisfies Result
}

// noinspection JSUnusedLocalSymbols
/**
 * For test the dynamic return type by input selector
 */
// @ts-expect-error This function should be shaken off by esbuild
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function testUsingSelector() {
  const selector = {
    title: (input: AsyncIterable<string>) => <Promise<string>>firstAsync(input),
    content: {
      text: (input: AsyncIterable<string>) => <Promise<string>>firstAsync(input)
    }
  } as const satisfies Selectors<string>
  const input = {
    title: toAsyncIterable(['title']),
    content: {
      text: toAsyncIterable(['text'])
    }
  }
  type Result = {
    title: string
    content: {
      text: string
    }
  }
  const selectors = usingSelector(selector, {})
  const result = await selectors(input)
  return result satisfies Result
}
