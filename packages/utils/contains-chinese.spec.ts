import test from 'ava'
import containsChinese from './contains-chinese.js'

test('should return true when the string contains Chinese', (t) => {
  t.true(containsChinese('你好'))
})

test('should return false when the string does not contain Chinese', (t) => {
  t.false(containsChinese('hello'))
})
