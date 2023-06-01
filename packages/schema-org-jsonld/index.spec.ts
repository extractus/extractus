import test from 'ava'
import schemaOrgJsonld from './index.js'

test('should extract title', async (t) => {
  const html = `
      <html><head>
        <script type='application/ld+json'>{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": "headline",
          "@graph": [{
            "headline": "Nested headline"
          }]
        }</script></head></html>`
  const result = schemaOrgJsonld.title(html)
  t.is(result.next().value, 'headline')
  t.is(result.next().value, 'Nested headline')
  t.true(result.next().done)
})

test('should extract url', async (t) => {
  const html = `
      <html><head>
        <script type='application/ld+json'>{
          "url": "https://url",
          "headline": "headline",
          "@graph": [{
            "url": "https://nested-url",
            "headline": "headline"
          }]
        }</script></head></html>`
  const result = schemaOrgJsonld.url(html)
  t.is(result.next().value, 'https://url')
  t.is(result.next().value, 'https://nested-url')
  t.true(result.next().done)
})

test('should extract author name', async (t) => {
  const html = `
      <html><head>
        <script type='application/ld+json'>{
          "author": {
            "@type": "Person",
            "name": "author name",
            "brand": "brand name"
          },
          "@graph": [{
            "author": {
              "@type": "Person",
              "name": "nested author name",
              "brand": "nested brand name"
            }
          }]
        }</script></head></html>`
  const result = schemaOrgJsonld.author.name(html)
  t.is(result.next().value, 'author name')
  t.is(result.next().value, 'nested author name')
  t.is(result.next().value, 'brand name')
  t.is(result.next().value, 'nested brand name')
  t.true(result.next().done)
})

test('should extract author url', async (t) => {
  const html = `
      <html><head>
        <script type='application/ld+json'>{
          "author": {
            "@type": "Person",
            "url": "https://url"
          },
          "@graph": [{
            "author": {
              "@type": "Person",
              "url": "https://nested-url"
            }
          }]
        }</script></head></html>`
  const result = schemaOrgJsonld.author.url(html)
  t.is(result.next().value, 'https://url')
  t.is(result.next().value, 'https://nested-url')
  t.true(result.next().done)
})
