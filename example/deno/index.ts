import { extract } from "https://esm.sh/@extractus/extractus"
import {dirname, resolve} from "https://deno.land/std@0.219.0/path/mod.ts";
import {assertEquals} from "https://deno.land/std@0.218.0/assert/assert_equals.ts";
import readTextFile = Deno.readTextFile;

Deno.test('extract', async () => {
    const html = await readTextFile(resolve(dirname(import.meta.url), 'test/data/meta-test.html'))
    const result = await extract(html)
    assertEquals(result, {
        author: {
            name: 'jsonld',
            url: 'https://jsonld.com'
        },
        title: 'jsonld',
        url: 'https://og.com'
    })
})
