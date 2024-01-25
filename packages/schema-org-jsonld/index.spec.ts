/* eslint-disable unicorn/no-await-expression-member */
// noinspection HtmlRequiredTitleElement,HtmlRequiredLangAttribute

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
  t.is((await result.next()).value, 'headline')
  t.is((await result.next()).value, 'Nested headline')
  t.true((await result.next()).done)
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
  t.is((await result.next()).value, 'https://url')
  t.is((await result.next()).value, 'https://nested-url')
  t.true((await result.next()).done)
})

test('should extract description', async (t) => {
  const html = `
      <html><head>
        <script type='application/ld+json'>{
          "articleBody": "articleBody",
          "description": "description",
          "headline": "headline",
          "@graph": [{
            "articleBody": "nested articleBody",
            "description": "nested description",
            "headline": "headline"
          }]
        }</script></head></html>`
  const result = schemaOrgJsonld.description(html)
  t.is((await result.next()).value, 'articleBody')
  t.is((await result.next()).value, 'nested articleBody')
  t.is((await result.next()).value, 'description')
  t.is((await result.next()).value, 'nested description')
  t.true((await result.next()).done)
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
  t.is((await result.next()).value, 'author name')
  t.is((await result.next()).value, 'nested author name')
  t.is((await result.next()).value, 'brand name')
  t.is((await result.next()).value, 'nested brand name')
  t.true((await result.next()).done)
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
  t.is((await result.next()).value, 'https://url')
  t.is((await result.next()).value, 'https://nested-url')
  t.true((await result.next()).done)
})

test('should extract image', async (t) => {
  const html = `
      <html><head>
        <script type='application/ld+json'>{
          "image": "https://image",
          "headline": "headline",
          "@graph": [{
            "image": "https://nested-image",
            "headline": "headline"
          }]
        }</script></head></html>`
  const result = schemaOrgJsonld.image(html)
  t.is((await result.next()).value, 'https://image')
  t.is((await result.next()).value, 'https://nested-image')
  t.true((await result.next()).done)
})

test('should not extract image when it is not creative work', async (t) => {
  const html = `
      <html><head>
        <script type='application/ld+json'>{
          "image": "https://image"
        }</script></head></html>`
  const result = schemaOrgJsonld.image(html)
  t.is((await result.next()).value, undefined)
  t.true((await result.next()).done)
})

test('should extract language', async (t) => {
  const html = `
      <html><head>
        <script type='application/ld+json'>{
          "inLanguage": "en",
          "headline": "headline",
          "@graph": [{
            "inLanguage": "nested en",
            "headline": "headline"
          }]
        }</script></head></html>`
  const result = schemaOrgJsonld.language(html)
  t.is((await result.next()).value, 'en')
  t.is((await result.next()).value, 'nested en')
  t.true((await result.next()).done)
})

test('should extract date published', async (t) => {
  const html = `
      <html><head>
        <script type='application/ld+json'>{
          "datePublished": "2020-01-01",
          "dateCreated": "2020-01-02",
          "headline": "headline",
          "@graph": [{
            "datePublished": "2020-01-03",
            "dateCreated": "2020-01-04",
            "headline": "headline"
          }]
        }</script></head></html>`
  const result = schemaOrgJsonld.date.published(html)
  t.is((await result.next()).value, '2020-01-01')
  t.is((await result.next()).value, '2020-01-03')
  t.is((await result.next()).value, '2020-01-02')
  t.is((await result.next()).value, '2020-01-04')
  t.true((await result.next()).done)
})

test('should extract date modified', async (t) => {
  const html = `
      <html><head>
        <script type='application/ld+json'>{
          "dateModified": "2020-01-01",
          "uploadDate": "2020-01-02",
          "headline": "headline",
          "@graph": [{
            "dateModified": "2020-01-03",
            "uploadDate": "2020-01-04",
            "headline": "headline"
          }]
        }</script></head></html>`
  const result = schemaOrgJsonld.date.modified(html)
  t.is((await result.next()).value, '2020-01-01')
  t.is((await result.next()).value, '2020-01-03')
  t.is((await result.next()).value, '2020-01-02')
  t.is((await result.next()).value, '2020-01-04')
  t.true((await result.next()).done)
})
