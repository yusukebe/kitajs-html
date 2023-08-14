import assert from 'node:assert'
import test from 'node:test'
import html from '../index'

test('simple html structures', () => {
  assert.equal(<a href="test">a link</a>, '<a href="test">a link</a>')

  assert.equal(
    `<ul><li>1</li><li>2</li></ul>`,
    <ul>
      {[1, 2].map((li) => (
        <li>{li}</li>
      ))}
    </ul>
  )

  assert.equal(
    '<button onclick="doSomething"></button>',
    <button onclick="doSomething"></button>
  )

  assert.equal('<div class="class-a"></div>', <div class="class-a"></div>)

  assert.equal(
    '<script src="jquery.js" integrity="sha256-123=" crossorigin="anonymous"></script>',
    <script
      src="jquery.js"
      integrity="sha256-123="
      crossorigin="anonymous"></script>
  )
})
