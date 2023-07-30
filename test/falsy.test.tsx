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
})
