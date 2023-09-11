/// <reference path="../htmx.d.ts" />

import assert from 'node:assert'
import test from 'node:test'
import Html from '../index'

test('Htmx properties', () => {
  assert.equal(
    //@ts-expect-error - should warn about invalid property
    <div
      //
      hx-boost
      hx-headers></div>,
    '<div hx-boost hx-headers></div>'
  )

  assert.equal(<div hx-boost></div>, '<div hx-boost></div>')
  assert.equal(<div hx-target="find "></div>, '<div hx-swap="id"></div>')
})
