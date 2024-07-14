import { test, expect } from 'bun:test'
import Bun from 'bun'
import { extract } from '../../packages/extractus/index.js'
import path from 'path'

test('extract', async () => {
  const html = await Bun.file(
    path.resolve(import.meta.dir, '../../test/data/meta-test.html')
  ).text()
  const result = await extract(html)
  expect(result).toEqual({
    author: {
      name: 'jsonld',
      url: 'https://jsonld.com'
    },
    title: 'jsonld',
    url: 'https://og.com'
  })
})
