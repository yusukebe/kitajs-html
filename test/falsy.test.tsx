import assert from 'node:assert'
import test from 'node:test'
import html from '../index'

test('falsy values', () => {
  assert.equal(
    <>
      {false}
      {null}
      {undefined}
    </>,
    'false'
  )

  assert.equal(
    <div id="truthy" hidden={false} spellcheck={true} translate={undefined}></div>,
    '<div id="truthy" spellcheck></div>'
  )
})
