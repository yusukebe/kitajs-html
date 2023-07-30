import assert from 'node:assert'
import test from 'node:test'
import html from '../index'

const Header: html.Component<any> = ({ children, ...attributes }) => (
  <h1 {...attributes}>{children}</h1>
)

function Button({ children, ...attributes }: html.PropsWithChildren<any>) {
  return (
    <button type="button" class="original-class" {...attributes}>
      {children}
    </button>
  )
}

test('React-style children', () => {
  assert.equal(
    '<h1 class="title"><span>Header Text</span></h1>',
    <Header class="title">
      <span>Header Text</span>
    </Header>
  )

  assert.equal(
    '<button type="button" class="override"></button>',
    <Button class="override" />
  )

  assert.equal(
    '<button type="button" class="original-class">Button Text</button>',
    <Button>Button Text</Button>
  )
})
