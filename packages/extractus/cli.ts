import { defineCommand, runMain } from 'citty'
import { isURLString } from 'extra-utils'
import { ofetch } from 'ofetch'
import path from 'path'
import fs from 'fs/promises'
import { extract } from './index.js'
import objectInspect from 'object-inspect'
import logger from './logger.js'

const main = defineCommand({
  args: {
    input: {
      type: 'positional',
      description: 'Url, html string, html file path',
      required: true
    }
  },
  async run({ args }) {
    let input = args.input
    if (isURLString(args.input)) {
      input = await ofetch(args.input)
    }
    try {
      const filepath = path.format(path.parse(input))
      input = (await fs.readFile(filepath)).toString()
    } catch (error) {}
    logger.info(objectInspect(await extract(input), { indent: 2 }))
  }
})

runMain(main)
