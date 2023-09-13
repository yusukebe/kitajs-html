import assert from 'node:assert'
import test from 'node:test'
import Html from '../index'

test('should encode " as &#34', () => {
  assert.equal(<div class={'"'}></div>, '<div class="&#34;"></div>')
})

test('should not encode & as &amp', () => {
  assert.equal(<div class={'&'}></div>, '<div class="&"></div>')
})

test('should not encode \\u00A0 as &#32', () => {
  assert.equal(<div class={'\u00A0'}></div>, '<div class="\u00A0"></div>')
})
