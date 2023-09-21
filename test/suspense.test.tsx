//@ts-nocheck

import assert from 'node:assert'
import { Readable } from 'node:stream'
import { afterEach, it } from 'node:test'
import Html from '../index'
import { Suspense, renderToStream, SUSPENSE_ROOT } from '../suspense'

function Async(): Promise<string> {
  return new Promise((res) => {
    setImmediate(res, 'Hello World')
  })
}

function streamToString(stream: Readable) {
  return new Promise((res) => {
    let str = ''
    stream.on('data', (chunk) => {
      str += chunk
    })
    stream.on('end', () => res(str))
  })
}

// Detect leaks of pending promises
afterEach(() => {
  assert.equal(SUSPENSE_ROOT.pending.size, 0)
  SUSPENSE_ROOT.pending = new Map()

  assert.equal(SUSPENSE_ROOT.handlers.size, 0)
  SUSPENSE_ROOT.handlers = new Map()
})

it('tests sync without suspense', async () => {
  let stream = renderToStream(() => <div></div>)
  assert.equal(await streamToString(stream), <div></div>)

  stream = renderToStream(async () => <div></div>)
  assert.equal(await streamToString(stream), <div></div>)
})

it('tests suspense sync children', async () => {
  let stream = renderToStream((r) => (
    <Suspense rid={r} fallback={<div>1</div>}>
      <div>2</div>
    </Suspense>
  ))

  assert.equal(await streamToString(stream), <div>2</div>)
})

it('tests suspense async children', async () => {
  let stream = renderToStream((r) => (
    <Suspense rid={r} fallback={<div>1</div>}>
      <Async>2</Async>
    </Suspense>
  ))

  assert.equal(
    await streamToString(stream),
    <>
      <div id="B:1" data-fallback>
        <div>1</div>
      </div>

      <template id="N:1" data-replace>
        Hello World
      </template>
      <script>$RC("N:1", "B:1");</script>
    </>
  )
})

it('tests suspense async children & fallback', async () => {
  let stream = renderToStream((r) => (
    <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
      <Async>2</Async>
    </Suspense>
  ))

  assert.equal(
    await streamToString(stream),
    <>
      <div id="B:1" data-fallback>
        <div>1</div>
      </div>

      <template id="N:1" data-replace>
        Hello World
      </template>
      <script>$RC("N:1", "B:1");</script>
    </>
  )
})

it('tests suspense async fallback sync children', async () => {
  let stream = renderToStream((r) => (
    <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
      <div>2</div>
    </Suspense>
  ))

  assert.equal(await streamToString(stream), '<div>2</div>')
})

it('tests multiple async renders cleanup', async () => {
  await Promise.all(
    Array.from({ length: 100 }, () => {
      return streamToString(
        renderToStream((r) => {
          return (
            <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
              <Async>2</Async>
            </Suspense>
          )
        })
      ).then((res) => {
        assert.equal(
          res,
          <>
            <div id="B:1" data-fallback>
              <div>1</div>
            </div>

            <template id="N:1" data-replace>
              Hello World
            </template>
            <script>$RC("N:1", "B:1");</script>
          </>
        )
      })
    })
  )
})

it('tests multiple sync renders cleanup', async () => {
  for (let i = 0; i < 100; i++) {
    let stream = renderToStream((r) => (
      <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
        <Async>2</Async>
      </Suspense>
    ))

    assert.equal(
      await streamToString(stream),
      <>
        <div id="B:1" data-fallback>
          <div>1</div>
        </div>

        <template id="N:1" data-replace>
          Hello World
        </template>
        <script>$RC("N:1", "B:1");</script>
      </>
    )
  }
})

it('tests multiple children', async () => {
  let stream = renderToStream((r) => (
    <div>
      <Suspense rid={r} fallback={<div>1</div>}>
        <Async>4</Async>
      </Suspense>

      <Suspense rid={r} fallback={<div>2</div>}>
        <Async>5</Async>
      </Suspense>

      <Suspense rid={r} fallback={<div>3</div>}>
        <Async>6</Async>
      </Suspense>
    </div>
  ))

  assert.equal(
    await streamToString(stream),
    <>
      <div>
        <div id="B:1" data-fallback>
          <div>1</div>
        </div>
        <div id="B:2" data-fallback>
          <div>2</div>
        </div>
        <div id="B:3" data-fallback>
          <div>3</div>
        </div>
      </div>

      <template id="N:1" data-replace>
        Hello World
      </template>
      <script>$RC("N:1", "B:1");</script>

      <template id="N:2" data-replace>
        Hello World
      </template>
      <script>$RC("N:2", "B:2");</script>

      <template id="N:3" data-replace>
        Hello World
      </template>
      <script>$RC("N:3", "B:3");</script>
    </>
  )
})
