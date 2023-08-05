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
      <div escapeInnerHtml>{unsafeTag}</div>
    </>,
    <>
      <div>{safeTag}</div>
    </>
  )
})

test('escapes children', () => {
  assert.equal(
    <>
      <div escapeInnerHtml>
        <div>{unsafeTag}</div>
      </div>
    </>,
    <>
      <div>{html.escapeHtml(<div>{unsafeTag}</div>)}</div>
    </>
  )
})
