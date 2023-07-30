import assert from 'node:assert'
import test from 'node:test'
import html from '../index'

test('custom tag', () => {
  assert.equal(<tag of="asd" attr />, '<asd attr/>')

  assert.equal(<tag of="asd" attr></tag>, '<asd attr/>')

  assert.equal(
    <tag of="asd" attr>
      1
    </tag>,
    '<asd attr>1</asd>'
  )

  assert.equal(
    <tag of="asd" attr>
      {' '}
    </tag>,
    '<asd attr> </asd>'
  )
})
