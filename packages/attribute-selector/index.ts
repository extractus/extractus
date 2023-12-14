import isStringAndNotBlank from '@extractus/utils/is-string-and-not-blank.js'

const _providers = <const>{
  text: <T extends HTMLElement>(element: T) => element.textContent,
  attr: <T extends HTMLElement>(element: T, name: string) => element.getAttribute(name)
}

const providers = <Record<Attributes, (element: Element, name?: string) => string>>_providers

type Attributes = keyof typeof _providers

function getAttributeArgument<Attribute extends Attributes>(
  selector: string,
  result: {
    key: Attribute
    index: number
  }
) {
  if (selector.endsWith(')')) {
    const argument = selector.slice(result.index + result.key.length + 2 + 1, -1)
    if (argument.length === 0) throw new LackArgumentError(result.key)
    return argument
  }
  throw new LackArgumentError(result.key)
}

function getAttributeKey(selector: string) {
  for (const key in providers) {
    if (selector.endsWith(`::${key}`)) {
      return {
        key: <Attributes>key,
        index: selector.length - key.length - 2
      }
    } else if (selector.endsWith(')')) {
      const index = selector.lastIndexOf('(')
      const realKey = selector.slice(index - key.length, index)
      return {
        key: <Attributes>realKey,
        index: index - key.length - 2
      }
    }
  }
  return
}

/**
 * @param document {@link Document} object
 * @param selector Normal css selector that optionally get text or attribute by `::text` or `::attr(name)`.
 *                 The extra pesudo class have to at the end of selector.
 * @return string[]
 */
export default function (document: HTMLDocument, selector: string) {
  const result = getAttributeKey(selector)
  if (result) {
    const provider = providers[result.key]
    return provider.length > 1
      ? // eslint-disable-next-line unicorn/prefer-spread
        Array.from(document.querySelectorAll(selector.slice(0, result.index)))
          .map((it) => provider(<HTMLElement>it, getAttributeArgument(selector, result)))
          .filter((element) => isStringAndNotBlank(element))
      : // eslint-disable-next-line unicorn/prefer-spread
        Array.from(document.querySelectorAll(selector.slice(0, result.index)))
          .map((it) => provider(<HTMLElement>it))
          .filter((element) => isStringAndNotBlank(element))
  }

  try {
    // eslint-disable-next-line unicorn/prefer-spread
    return Array.from(document.querySelectorAll(selector))
  } catch {
    return []
  }
}

export class LackArgumentError extends Error {
  constructor(key: Attributes) {
    super(`"::${key}" need an argument`)
  }
}
