import { Culture } from '@microsoft/recognizers-text-date-time'
import test from 'ava'
import { guessLanguage } from './guess-language.js'

test('should guess the Chinese', (t) => {
  t.is(guessLanguage('你好世界'), Culture.Chinese)
  t.is(guessLanguage('', { language: 'zh-Hans' }), Culture.Chinese)
  t.is(guessLanguage('', { language: 'zh-Hant' }), Culture.Chinese)
})

test('should guess the English', (t) => {
  t.is(guessLanguage('Hello world'), Culture.English)
  t.is(guessLanguage('', { language: 'en' }), Culture.EnglishOthers)
  t.is(guessLanguage('', { language: 'unknown' }), Culture.English)
})

test('should guess the others', (t) => {
  t.is(guessLanguage('', { language: 'fr' }), Culture.French)
})
