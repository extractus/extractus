import parseJson from './parse-json.js'
import test from 'ava'

test('should parse json', function (t) {
  t.deepEqual(parseJson('{"test": "test"}'), { test: 'test' })
})
