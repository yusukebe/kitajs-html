//@ts-nocheck

import assert from 'node:assert'
import { Readable } from 'node:stream'
import { afterEach, describe, test } from 'node:test'
import Html from '../index'
import { Suspense, renderToStream, SUSPENSE_ROOT } from '../suspense'

function SleepForMs({ children }): Promise<string> {
  return new Promise((res) => {
    setTimeout(() => res(children), Number(children) * 1.5) // just to differentiate 1ms and 2ms better
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

describe('Suspense', () => {
  test('Sync without suspense', async () => {
    let stream = renderToStream(() => <div></div>)
    assert.equal(await streamToString(stream), <div></div>)

    stream = renderToStream(async () => <div></div>)
    assert.equal(await streamToString(stream), <div></div>)
  })

  test('Suspense sync children', async () => {
    let stream = renderToStream((r) => (
      <Suspense rid={r} fallback={<div>1</div>}>
        <div>2</div>
      </Suspense>
    ))

    assert.equal(await streamToString(stream), <div>2</div>)
  })

  test('Suspense async children', async () => {
    let stream = renderToStream((r) => (
      <Suspense rid={r} fallback={<div>1</div>}>
        <SleepForMs>2</SleepForMs>
      </Suspense>
    ))

    assert.equal(
      await streamToString(stream),
      <>
        <div id="B:1" data-fallback>
          <div>1</div>
        </div>

        <template id="N:1" data-replace>
          2
        </template>
        <script>$RC("N:1", "B:1");</script>
      </>
    )
  })

  test('Suspense async children & fallback', async () => {
    let stream = renderToStream((r) => (
      <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
        <SleepForMs>2</SleepForMs>
      </Suspense>
    ))

    assert.equal(
      await streamToString(stream),
      <>
        <div id="B:1" data-fallback>
          <div>1</div>
        </div>

        <template id="N:1" data-replace>
          2
        </template>
        <script>$RC("N:1", "B:1");</script>
      </>
    )
  })

  test('Suspense async fallback sync children', async () => {
    let stream = renderToStream((r) => (
      <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
        <div>2</div>
      </Suspense>
    ))

    assert.equal(await streamToString(stream), '<div>2</div>')
  })

  test('Multiple async renders cleanup', async () => {
    await Promise.all(
      Array.from({ length: 100 }, () => {
        return streamToString(
          renderToStream((r) => {
            return (
              <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
                <SleepForMs>2</SleepForMs>
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
                2
              </template>
              <script>$RC("N:1", "B:1");</script>
            </>
          )
        })
      })
    )
  })

  test('Multiple sync renders cleanup', async () => {
    for (let i = 0; i < 100; i++) {
      let stream = renderToStream((r) => (
        <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
          <SleepForMs>2</SleepForMs>
        </Suspense>
      ))

      assert.equal(
        await streamToString(stream),
        <>
          <div id="B:1" data-fallback>
            <div>1</div>
          </div>

          <template id="N:1" data-replace>
            2
          </template>
          <script>$RC("N:1", "B:1");</script>
        </>
      )
    }
  })

  test('Multiple children', async () => {
    let stream = renderToStream((r) => (
      <div>
        <Suspense rid={r} fallback={<div>1</div>}>
          <SleepForMs>4</SleepForMs>
        </Suspense>

        <Suspense rid={r} fallback={<div>2</div>}>
          <SleepForMs>5</SleepForMs>
        </Suspense>

        <Suspense rid={r} fallback={<div>3</div>}>
          <SleepForMs>6</SleepForMs>
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
          4
        </template>
        <script>$RC("N:1", "B:1");</script>

        <template id="N:2" data-replace>
          5
        </template>
        <script>$RC("N:2", "B:2");</script>

        <template id="N:3" data-replace>
          6
        </template>
        <script>$RC("N:3", "B:3");</script>
      </>
    )
  })

  test('Concurrent renders', async () => {
    const streams = []

    for (const seconds of [9, 4, 7]) {
      streams.push(
        renderToStream((r) => (
          <div>
            {Array.from({ length: seconds }, (_, i) => (
              <Suspense rid={r} fallback={<div>{seconds - i} loading</div>}>
                <SleepForMs>{seconds - i}</SleepForMs>
              </Suspense>
            ))}
          </div>
        ))
      )
    }

    const results = await Promise.all(streams.map(streamToString))

    assert.deepEqual(results, [
      <>
        <div>
          <div id="B:1" data-fallback>
            <div>9 loading</div>
          </div>
          <div id="B:2" data-fallback>
            <div>8 loading</div>
          </div>
          <div id="B:3" data-fallback>
            <div>7 loading</div>
          </div>
          <div id="B:4" data-fallback>
            <div>6 loading</div>
          </div>
          <div id="B:5" data-fallback>
            <div>5 loading</div>
          </div>
          <div id="B:6" data-fallback>
            <div>4 loading</div>
          </div>
          <div id="B:7" data-fallback>
            <div>3 loading</div>
          </div>
          <div id="B:8" data-fallback>
            <div>2 loading</div>
          </div>
          <div id="B:9" data-fallback>
            <div>1 loading</div>
          </div>
        </div>
        <template id="N:9" data-replace>
          1
        </template>
        <script>$RC("N:9", "B:9");</script>
        <template id="N:8" data-replace>
          2
        </template>
        <script>$RC("N:8", "B:8");</script>
        <template id="N:7" data-replace>
          3
        </template>
        <script>$RC("N:7", "B:7");</script>
        <template id="N:6" data-replace>
          4
        </template>
        <script>$RC("N:6", "B:6");</script>
        <template id="N:5" data-replace>
          5
        </template>
        <script>$RC("N:5", "B:5");</script>
        <template id="N:4" data-replace>
          6
        </template>
        <script>$RC("N:4", "B:4");</script>
        <template id="N:3" data-replace>
          7
        </template>
        <script>$RC("N:3", "B:3");</script>
        <template id="N:2" data-replace>
          8
        </template>
        <script>$RC("N:2", "B:2");</script>
        <template id="N:1" data-replace>
          9
        </template>
        <script>$RC("N:1", "B:1");</script>
      </>,

      <>
        <div>
          <div id="B:1" data-fallback>
            <div>4 loading</div>
          </div>
          <div id="B:2" data-fallback>
            <div>3 loading</div>
          </div>
          <div id="B:3" data-fallback>
            <div>2 loading</div>
          </div>
          <div id="B:4" data-fallback>
            <div>1 loading</div>
          </div>
        </div>
        <template id="N:4" data-replace>
          1
        </template>
        <script>$RC("N:4", "B:4");</script>
        <template id="N:3" data-replace>
          2
        </template>
        <script>$RC("N:3", "B:3");</script>
        <template id="N:2" data-replace>
          3
        </template>
        <script>$RC("N:2", "B:2");</script>
        <template id="N:1" data-replace>
          4
        </template>
        <script>$RC("N:1", "B:1");</script>
      </>,

      <>
        <div>
          <div id="B:1" data-fallback>
            <div>7 loading</div>
          </div>
          <div id="B:2" data-fallback>
            <div>6 loading</div>
          </div>
          <div id="B:3" data-fallback>
            <div>5 loading</div>
          </div>
          <div id="B:4" data-fallback>
            <div>4 loading</div>
          </div>
          <div id="B:5" data-fallback>
            <div>3 loading</div>
          </div>
          <div id="B:6" data-fallback>
            <div>2 loading</div>
          </div>
          <div id="B:7" data-fallback>
            <div>1 loading</div>
          </div>
        </div>
        <template id="N:7" data-replace>
          1
        </template>
        <script>$RC("N:7", "B:7");</script>
        <template id="N:6" data-replace>
          2
        </template>
        <script>$RC("N:6", "B:6");</script>
        <template id="N:5" data-replace>
          3
        </template>
        <script>$RC("N:5", "B:5");</script>
        <template id="N:4" data-replace>
          4
        </template>
        <script>$RC("N:4", "B:4");</script>
        <template id="N:3" data-replace>
          5
        </template>
        <script>$RC("N:3", "B:3");</script>
        <template id="N:2" data-replace>
          6
        </template>
        <script>$RC("N:2", "B:2");</script>
        <template id="N:1" data-replace>
          7
        </template>
        <script>$RC("N:1", "B:1");</script>
      </>
    ])
  })
})
