import assert from 'assert'
import { it } from 'node:test'
import Html from '../index'

it('tests undefined contents', async () => {
  assert.equal(
    await Html.contentsToString([
      undefined,
      Promise.resolve(undefined),
      [undefined, Promise.resolve(undefined)],
      null,
      Promise.resolve(null),
      [null, Promise.resolve(null)],
      [[[[[[[]]]]]]]
    ]),
    ''
  )
})

it('tests deep scaping', async () => {
  assert.equal(
    await Html.contentsToString(['<>', Promise.resolve('<>')], true),
    '&lt;>&lt;>'
  )

  assert.equal(
    await Html.contentsToString(
      [
        undefined,
        Promise.resolve(undefined),
        [undefined, Promise.resolve(undefined)],
        null,
        Promise.resolve(null),
        [null, Promise.resolve(null)],
        [[[[[[['<>']]]]]]]
      ],
      true
    ),
    '&lt;>'
  )
})

it('tests string contents', async () => {
  assert.equal(
    await Html.contentsToString([
      'a',
      Promise.resolve('b'),
      ['c', Promise.resolve('d')]
    ]),
    'abcd'
  )
})

it('tests promises', async () => {
  const result = Html.contentsToString([
    Promise.resolve('a'),
    Promise.resolve('b'),
    Promise.resolve(['c', Promise.resolve('d')])
  ])

  assert.ok(result instanceof Promise)
  assert.equal(await result, 'abcd')
})

it('tests h function', async () => {
  assert.equal(Html.h, Html.createElement)
})
