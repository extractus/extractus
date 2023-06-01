import memoize from 'micro-memoize'

// https://github.com/planttheidea/micro-memoize/issues/104
export default (<typeof memoize.default>(<unknown>memoize))
