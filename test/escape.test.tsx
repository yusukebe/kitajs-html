import assert from 'node:assert'
import test from 'node:test'
import html from '../index'

const unsafeTag = '<script tag="1">alert(1)</script>'
const safeTag = html.escapeHtml(unsafeTag)

test('escapes content', () => {
  assert.equal(<>{unsafeTag}</>, <>{unsafeTag}</>)
})

test('with children', () => {
  assert.equal(
    <>
      <div>{unsafeTag}</div>
    </>,
    <>
      <div>{unsafeTag}</div>
    </>
  )
})

test('escapes children', () => {
  assert.equal(
    <>
      <div safe>{unsafeTag}</div>
    </>,
    <>
      <div>{safeTag}</div>
    </>
  )
})

test('escapes deep children', () => {
  assert.equal(
    <>
      <div safe>
        <div>{unsafeTag}</div>
      </div>
    </>,
    <>
      <div>{html.escapeHtml(<div>{unsafeTag}</div>)}</div>
    </>
  )
})

test('always escapes attributes', () => {
  assert.equal(
    <>
      <div style={'"&<>\''}></div>
      <div style={{ backgroundColor: '"&<>\'' }}></div>
      <div class={'"&<>\''}></div>
    </>,
    <>
      <div style="&#34;&amp;&lt;&gt;&#39;"></div>
      <div style="background-color:&#34;&amp;&lt;&gt;&#39;;"></div>
      <div class="&#34;&amp;&lt;&gt;&#39;"></div>
    </>
  )

  assert.equal(
    <>
      <div style={'"&<>\''}></div>
      <div style={{ backgroundColor: '"&<>\'' }}></div>
      <div class={'"&<>\''}></div>
    </>,
    `<div style="&#34;&amp;&lt;&gt;&#39;"></div><div style="background-color:&#34;&amp;&lt;&gt;&#39;;"></div><div class="&#34;&amp;&lt;&gt;&#39;"></div>`
  )
})

test('always escapeHtml', () => {
  const date = new Date()

  assert.equal(html.escapeHtml(date), date.toISOString())
  assert.equal(html.escapeHtml(null), 'null')
  assert.equal(html.escapeHtml(undefined), 'undefined')
  assert.equal(html.escapeHtml(true), 'true')
  assert.equal(html.escapeHtml(false), 'false')
  assert.equal(html.escapeHtml(0), '0')
  assert.equal(html.escapeHtml(1), '1')
  assert.equal(html.escapeHtml(1.1), '1.1')
  assert.equal(html.escapeHtml(''), '')
  assert.equal(html.escapeHtml('string'), 'string')
  assert.equal(html.escapeHtml([]), '')
  assert.equal(html.escapeHtml([1, 2, 3]), '1,2,3')
  assert.equal(html.escapeHtml({}), '[object Object]')
})
