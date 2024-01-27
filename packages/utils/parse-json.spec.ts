import test from 'ava'
import parseJson from './parse-json.js'

test('should parse json', function (t) {
  t.deepEqual(parseJson('{"test": "test"}'), { test: 'test' })
})
