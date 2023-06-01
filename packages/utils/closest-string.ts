import { distance } from 'fastest-levenshtein'

export default (source: string, ...targets: Array<string | undefined>) => {
  let distribution = Number.POSITIVE_INFINITY
  let result = source
  for (const target of targets) {
    if (!target) continue
    const current = distance(source, target)
    if (distribution > current) {
      result = target
      distribution = current
    }
  }
  if (source === result) distribution = 0
  return { source, result, distance: distribution }
}
