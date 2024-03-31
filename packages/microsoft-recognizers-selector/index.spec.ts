import test, { type ExecutionContext } from 'ava'
import dayjs from 'dayjs'
import { toAsyncIterable } from 'iterable-operator'
import dateSelector from './index.js'

// 2000-12-15 12:34:56
const date = new Date(Date.UTC(2000, 11, 15, 12, 34, 56))

const expectDate = async (input: string, t: ExecutionContext) => {
  const it = await dateSelector.date.published(toAsyncIterable([input]))
  t.is(it, date.getTime())
}

test('should parse standards', async (t) => {
  // TODO Handle timezone from context? `@microsoft/recognizers-text-date-time` won't play with timezone
  // https://github.com/microsoft/Recognizers-Text/issues/219
  // await expectDate(date.toISOString(), t)
  // await expectDate(date.toUTCString(), t)
  await expectDate(date.toLocaleString(), t)
})

test('should parse chinese', async (t) => {
  await expectDate('2000年12月15日 20点34分56秒', t)
})

test('should parse relative', async (t) => {
  const timestamp = dayjs().subtract(3, 'minutes').set('millisecond', 0).unix()
  return Promise.all([
    dateSelector.date
      .published(toAsyncIterable(['3分钟前']))
      .then((it) => Math.floor(it! / 1000))
      .then((it) => t.true(it - timestamp <= 1)),
    dateSelector.date
      .published(toAsyncIterable(['3 minutes ago']))
      .then((it) => Math.floor(it! / 1000))
      .then((it) => t.true(it - timestamp <= 1))
  ])
})

test('should parse just now', async (t) => {
  const timestamp = dayjs().unix()
  return Promise.all([
    dateSelector.date
      .published(toAsyncIterable(['Now']))
      .then((it) => Math.floor(it! / 1000))
      .then((it) => t.true(it - timestamp <= 1)),
    dateSelector.date
      .published(toAsyncIterable(['刚刚']))
      .then((it) => Math.floor(it! / 1000))
      .then((it) => t.true(it - timestamp <= 1))
  ])
})
