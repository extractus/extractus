/* eslint-disable unicorn/no-await-expression-member */

import test from 'ava'
import genericExtractor from './index.js'

test('should extract title', async (t) => {
  const input = `
    <html><head><title>Page Title</title></head>
    <body>
    <span class='post-title'>Post Title</span>
    <span class='entry-title'>Entry Title</span>
    <h2 class='test-title'>h2 Title</h2>
    <h1 class='dsadsatitle'>h1 Title</h1>
    </body></html>
  `
  const output = genericExtractor.title(input)

  t.is((await output.next()).value, 'Post Title')
  t.is((await output.next()).value, 'Entry Title')
  t.is((await output.next()).value, 'h2 Title')
  t.is((await output.next()).value, 'h1 Title')
  t.is((await output.next()).value, 'Page Title')
  t.true((await output.next()).done)
})

test('should extract url', async (t) => {
  const input = `
    <html><head><title>Page Title</title></head>
    <body>
    <span class='post-title'><a href='https://post-title.com'>Post Title</a></span>
    <span class='entry-title'><a href='https://entry-title.com'>Entry Title</a></span>
    <h2 class='test-title'><a href='https://h2-title.com'>h2 Title</a></h2>
    <h1 class='dsadsatitle'><a href='https://h1-title.com'>h1 Title</a></h1>
    </body></html>
  `
  const output = genericExtractor.url(input)
  t.is((await output.next()).value, 'https://post-title.com')
  t.is((await output.next()).value, 'https://entry-title.com')
  t.is((await output.next()).value, 'https://h2-title.com')
  t.is((await output.next()).value, 'https://h1-title.com')
  t.true((await output.next()).done)
})

test('should extract author name', async (t) => {
  const input = `
    <html><head><title>Page Title</title></head>
    <body>
    <div itemprop='author'>
      <span itemprop='name'>Prop Name Author Name</span>
    </div>
    <span itemprop='author'>Prop Author Name</span>
    <span rel='author'>Rel Author Name</span>
    <a class='author-name'>Class Author Name</a>
    <span class='author-name'><a>Class Span A Author Name</a></span>
    <a href='/author/author-name'>Link Author Name</a>
    <span class='author-name'>Class Span Author Name</span>
    </body></html>
  `
  const output = genericExtractor.author.name(input)
  t.is((await output.next()).value, 'Prop Name Author Name')
  t.is((await output.next()).value, 'Prop Name Author Name')
  t.is((await output.next()).value, 'Prop Author Name')
  t.is((await output.next()).value, 'Rel Author Name')
  t.is((await output.next()).value, 'Class Author Name')
  t.is((await output.next()).value, 'Class Span A Author Name')
  t.is((await output.next()).value, 'Link Author Name')
  t.is((await output.next()).value, 'Class Author Name')
  t.is((await output.next()).value, 'Class Span A Author Name')
  t.is((await output.next()).value, 'Class Span Author Name')
  t.true((await output.next()).done)
})

test('should extract author url', async (t) => {
  const input = `
    <html><head><title>Page Title</title></head>
    <body>
    <div itemprop='author'>
      <a itemprop='url' href='https://prop-name-author-name.com'></a>
    </div>
    <a itemprop='author' href='https://prop-author-name.com'>Prop Author Name</a>
    <a rel='author' href='https://rel-author-name.com'>Rel Author Name</a>
    <a class='author-name' href='https://class-author-name.com'>Class Author Name</a>
    <span class='author-name'>
      <a href='https://class-span-a-author-name.com'>Class Span A Author Name</a>
    </span>
    <span class='author-name'>
      <a href='https://class-span-author-name.com'>Class Span Author Name</a>
    </span>
    <a href='https://test/author/author-name'>Link Author Name</a>
    </body></html>
  `
  const output = genericExtractor.author.url(input)
  t.is((await output.next()).value, 'https://prop-name-author-name.com')
  t.is((await output.next()).value, 'https://prop-author-name.com')
  t.is((await output.next()).value, 'https://rel-author-name.com')
  t.is((await output.next()).value, 'https://class-author-name.com')
  t.is((await output.next()).value, 'https://class-span-a-author-name.com')
  t.is((await output.next()).value, 'https://class-span-author-name.com')
  t.is((await output.next()).value, 'https://test/author/author-name')
  t.true((await output.next()).done)
})

test('should extract modified time', async (t) => {
  const input = `
    <html></head>
    <body>
    <div itemprop='dateModified' content='2021-08-02T03:00:00Z'></div>
    </body></html>
  `
  const output = genericExtractor.date.modified(input)
  t.is((await output.next()).value, '2021-08-02T03:00:00Z')
  t.true((await output.next()).done)
})

test('should extract published time', async (t) => {
  const input = `
    <html></head>
    <body>
    <div itemprop='datePublished' content='2021-08-02T02:00:00Z'></div>
    <time datetime='2021-08-02T03:00:00Z' pubdate></time>
    <time datetime='2021-08-02T04:00:00Z' itemprop='date'></time>
    <time datetime='2021-08-02T05:00:00Z'></time>
    <span itemprop='date' content='2021-08-02T06:00:00Z'></span>
    <span id='publish'>2021-08-02T07:00:00Z</span>
    <span id='post-timestamp'>2021-08-02T08:00:00Z</span>
    <span class='publish'>2021-08-02T09:00:00Z</span>
    <span class='post-timestamp'>2021-08-02T10:00:00Z</span>
    <span class='byline'>2021-08-02T11:00:00Z</span>
    <span class='dateline'>2021-08-02T12:00:00Z</span>
    <span id='metadata'>2021-08-02T13:00:00Z</span>
    <span class='metadata'>2021-08-02T14:00:00Z</span>
    <span id='date'>2021-08-02T15:00:00Z</span>
    <span class='date'>2021-08-02T16:00:00Z</span>
    <span id='post-meta'>2021-08-02T17:00:00Z</span>
    <span class='post-meta'>2021-08-02T18:00:00Z</span>
    <span id='post-time'>2021-08-02T19:00:00Z</span>
    <span class='post-time'>2021-08-02T20:00:00Z</span>
    </body></html>
  `
  const output = genericExtractor.date.published(input)
  t.is((await output.next()).value, '2021-08-02T02:00:00Z')
  t.is((await output.next()).value, '2021-08-02T03:00:00Z')
  t.is((await output.next()).value, '2021-08-02T04:00:00Z')

  // time[datetime]
  t.is((await output.next()).value, '2021-08-02T03:00:00Z')
  t.is((await output.next()).value, '2021-08-02T04:00:00Z')
  t.is((await output.next()).value, '2021-08-02T05:00:00Z')

  // [itemprop*="date" i]
  t.is((await output.next()).value, '2021-08-02T02:00:00Z')
  t.is((await output.next()).value, '2021-08-02T04:00:00Z')
  t.is((await output.next()).value, '2021-08-02T06:00:00Z')

  t.is((await output.next()).value, '2021-08-02T07:00:00Z')
  t.is((await output.next()).value, '2021-08-02T08:00:00Z')
  t.is((await output.next()).value, '2021-08-02T09:00:00Z')
  t.is((await output.next()).value, '2021-08-02T10:00:00Z')
  t.is((await output.next()).value, '2021-08-02T11:00:00Z')
  t.is((await output.next()).value, '2021-08-02T12:00:00Z')
  t.is((await output.next()).value, '2021-08-02T13:00:00Z')
  t.is((await output.next()).value, '2021-08-02T14:00:00Z')
  t.is((await output.next()).value, '2021-08-02T15:00:00Z')
  // [class*="date" i]
  t.is((await output.next()).value, '2021-08-02T12:00:00Z')
  t.is((await output.next()).value, '2021-08-02T16:00:00Z')

  t.is((await output.next()).value, '2021-08-02T17:00:00Z')
  t.is((await output.next()).value, '2021-08-02T18:00:00Z')

  // [id*="time" i]
  t.is((await output.next()).value, '2021-08-02T08:00:00Z')
  t.is((await output.next()).value, '2021-08-02T19:00:00Z')

  // [class*="time" i]
  t.is((await output.next()).value, '2021-08-02T10:00:00Z')
  t.is((await output.next()).value, '2021-08-02T20:00:00Z')
  t.true((await output.next()).done)
})
