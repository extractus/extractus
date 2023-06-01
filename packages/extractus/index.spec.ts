import test from 'ava'
import * as fs from 'node:fs/promises'
import { extract } from './index.js'
import * as path from 'node:path'
import * as url from 'node:url'

test('should extract from html', async (t) => {
  const html = await fs.readFile(path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), 'test/meta-test.html'), { encoding: 'utf8' })
  t.deepEqual(extract(html), {})
})
