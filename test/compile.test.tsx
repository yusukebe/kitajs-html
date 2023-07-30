import assert from 'node:assert'
import test from 'node:test'
import html from '../index'

const Header: html.Component<{ paramName: string }> = ({
  children,
  paramName
}) => <h1 class={`$parameterOne $${paramName}`}>{children}</h1>

function Button({ children }: html.PropsWithChildren) {
  return (
    <button type="button" class="$test-color">
      {children}
    </button>
  )
}

const template = html.compile<['parameterOne', 'p3a', 'test', 'last']>(
  <>
    <Header paramName="p3a"></Header>
    <span>Header ` ` \````Text</span>
    <Button>Button Text</Button>
    $last $notFound
  </>
)

test('compile', () => {
  // raw
  assert.equal(
    template({ parameterOne: '123', p3a: 321, test: 'red', last: 1 }),
    '<h1 class="123 321"></h1><span>Header ` ` \\````Text</span><button type="button" class="red-color">Button Text</button>1 $notFound'
  )

  // same output as non-compiled
  assert.equal(
    template({ parameterOne: '123', p3a: 321, test: 'cyan', last: 1 }),
    <>
      <h1 class="123 321"></h1>
      <span>Header ` ` \````Text</span>
      <button type="button" class="cyan-color">
        Button Text
      </button>
      1 $notFound
    </>
  )
})
