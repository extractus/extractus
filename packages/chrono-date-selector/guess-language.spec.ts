import test from 'ava'
import * as chrono from 'chrono-node'
import { guessLanguage } from './guess-language.js'

test('should guess the Chinese', (t) => {
  t.is(guessLanguage('你好世界'), chrono.zh.hans.casual)
  t.is(guessLanguage('', { language: 'zh-Hans' }), chrono.zh.hans.casual)
  t.is(guessLanguage('', { language: 'zh-Hant' }), chrono.zh.hant)
})

test('should guess the English', (t) => {
  t.is(guessLanguage('Hello world'), chrono.en.casual)
  t.is(guessLanguage('', { language: 'en' }), chrono.en.casual)
  t.is(guessLanguage('', { language: 'unknown' }), chrono.en.casual)
})

test('should guess the others', (t) => {
  t.is(guessLanguage('', { language: 'fr' }), chrono.fr.casual)
})
