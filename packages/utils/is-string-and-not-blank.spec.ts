import test from 'ava'
import isStringAndNotBlank from './is-string-and-not-blank.js'

test('should return true if the value is a string and not blank', (t) => {
  t.is(isStringAndNotBlank('a'), true)
})

test('should return false if the value is not a string', (t) => {
  t.is(isStringAndNotBlank(1), false)
  t.is(isStringAndNotBlank(true), false)
  // eslint-disable-next-line unicorn/no-null
  t.is(isStringAndNotBlank(null), false)
  // eslint-disable-next-line unicorn/no-useless-undefined
  t.is(isStringAndNotBlank(undefined), false)
  t.is(isStringAndNotBlank({}), false)
  t.is(isStringAndNotBlank([]), false)
})

test('should return false if the value is a string but blank', (t) => {
  t.is(isStringAndNotBlank(''), false)
  t.is(isStringAndNotBlank('  '), false)
})
