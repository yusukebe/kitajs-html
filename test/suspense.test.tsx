import assert from 'node:assert'
import { afterEach, describe, it, mock, test } from 'node:test'
import { setTimeout } from 'node:timers/promises'
import Html, { PropsWithChildren } from '../index'
import {
  Suspense,
  SuspenseScript,
  renderToStream,
  renderToString
} from '../suspense'

function SleepForMs({ children }: PropsWithChildren): Promise<string> {
  const ms = Number(children)

  // just to differentiate 1ms and 2ms better
  return setTimeout(ms * 2, String(ms))
}

function Throw(): string {
  throw new Error('test')
}

// Detect leaks of pending promises
afterEach(() => {
  assert.equal(
    SUSPENSE_ROOT.resources.size,
    0,
    'Suspense root left pending resources'
  )

  // Reset suspense root
  SUSPENSE_ROOT.enabled = false
  SUSPENSE_ROOT.autoScript = true
  SUSPENSE_ROOT.requestCounter = 1
  SUSPENSE_ROOT.resources.clear()
})

describe('Suspense', () => {
  test('Sync without suspense', async () => {
    assert.equal(await renderToString(() => <div></div>), <div></div>)

    assert.equal(await renderToString(async () => <div></div>), <div></div>)
  })

  test('Suspense sync children', async () => {
    assert.equal(
      await renderToString((r) => (
        <Suspense rid={r} fallback={<div>1</div>}>
          <div>2</div>
        </Suspense>
      )),
      <div>2</div>
    )
  })

  test('Suspense async children', async () => {
    assert.equal(
      await renderToString((r) => (
        <Suspense rid={r} fallback={<div>1</div>}>
          <SleepForMs>2</SleepForMs>
        </Suspense>
      )),
      <>
        <div id="B:1" data-sf>
          <div>1</div>
        </div>

        {SuspenseScript}

        <template id="N:1" data-sr>
          2
        </template>
        <script id="S:1" data-ss>
          $RC(1)
        </script>
      </>
    )
  })

  test('Suspense async children & fallback', async () => {
    assert.equal(
      await renderToString((r) => (
        <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
          <SleepForMs>2</SleepForMs>
        </Suspense>
      )),
      <>
        <div id="B:1" data-sf>
          <div>1</div>
        </div>

        {SuspenseScript}

        <template id="N:1" data-sr>
          2
        </template>
        <script id="S:1" data-ss>
          $RC(1)
        </script>
      </>
    )
  })

  test('Suspense async fallback sync children', async () => {
    assert.equal(
      await renderToString((r) => (
        <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
          <div>2</div>
        </Suspense>
      )),
      <>
        <div>2</div>
      </>
    )
  })

  test('Multiple async renders cleanup', async () => {
    await Promise.all(
      Array.from({ length: 100 }, () => {
        return renderToString((r) => {
          return (
            <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
              <SleepForMs>2</SleepForMs>
            </Suspense>
          )
        }).then((res) => {
          assert.equal(
            res,
            <>
              <div id="B:1" data-sf>
                <div>1</div>
              </div>

              {SuspenseScript}

              <template id="N:1" data-sr>
                2
              </template>
              <script id="S:1" data-ss>
                $RC(1)
              </script>
            </>
          )
        })
      })
    )
  })

  test('Multiple sync renders cleanup', async () => {
    for (let i = 0; i < 100; i++) {
      assert.equal(
        await renderToString((r) => (
          <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
            <SleepForMs>2</SleepForMs>
          </Suspense>
        )),
        <>
          <div id="B:1" data-sf>
            <div>1</div>
          </div>

          {SuspenseScript}

          <template id="N:1" data-sr>
            2
          </template>
          <script id="S:1" data-ss>
            $RC(1)
          </script>
        </>
      )
    }
  })

  test('Multiple children', async () => {
    assert.equal(
      await renderToString((r) => (
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
      )),
      <>
        <div>
          <div id="B:1" data-sf>
            <div>1</div>
          </div>
          <div id="B:2" data-sf>
            <div>2</div>
          </div>
          <div id="B:3" data-sf>
            <div>3</div>
          </div>
        </div>

        {SuspenseScript}

        <template id="N:1" data-sr>
          4
        </template>
        <script id="S:1" data-ss>
          $RC(1)
        </script>

        <template id="N:2" data-sr>
          5
        </template>
        <script id="S:2" data-ss>
          $RC(2)
        </script>

        <template id="N:3" data-sr>
          6
        </template>
        <script id="S:3" data-ss>
          $RC(3)
        </script>
      </>
    )
  })

  test('Concurrent renders', async () => {
    const promises = []

    for (const seconds of [9, 4, 7]) {
      promises.push(
        renderToString((r) => (
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

    const results = await Promise.all(promises)

    assert.deepEqual(results, [
      <>
        <div>
          <div id="B:1" data-sf>
            <div>9 loading</div>
          </div>
          <div id="B:2" data-sf>
            <div>8 loading</div>
          </div>
          <div id="B:3" data-sf>
            <div>7 loading</div>
          </div>
          <div id="B:4" data-sf>
            <div>6 loading</div>
          </div>
          <div id="B:5" data-sf>
            <div>5 loading</div>
          </div>
          <div id="B:6" data-sf>
            <div>4 loading</div>
          </div>
          <div id="B:7" data-sf>
            <div>3 loading</div>
          </div>
          <div id="B:8" data-sf>
            <div>2 loading</div>
          </div>
          <div id="B:9" data-sf>
            <div>1 loading</div>
          </div>
        </div>

        {SuspenseScript}

        <template id="N:9" data-sr>
          1
        </template>
        <script id="S:9" data-ss>
          $RC(9)
        </script>
        <template id="N:8" data-sr>
          2
        </template>
        <script id="S:8" data-ss>
          $RC(8)
        </script>
        <template id="N:7" data-sr>
          3
        </template>
        <script id="S:7" data-ss>
          $RC(7)
        </script>
        <template id="N:6" data-sr>
          4
        </template>
        <script id="S:6" data-ss>
          $RC(6)
        </script>
        <template id="N:5" data-sr>
          5
        </template>
        <script id="S:5" data-ss>
          $RC(5)
        </script>
        <template id="N:4" data-sr>
          6
        </template>
        <script id="S:4" data-ss>
          $RC(4)
        </script>
        <template id="N:3" data-sr>
          7
        </template>
        <script id="S:3" data-ss>
          $RC(3)
        </script>
        <template id="N:2" data-sr>
          8
        </template>
        <script id="S:2" data-ss>
          $RC(2)
        </script>
        <template id="N:1" data-sr>
          9
        </template>
        <script id="S:1" data-ss>
          $RC(1)
        </script>
      </>,

      <>
        <div>
          <div id="B:1" data-sf>
            <div>4 loading</div>
          </div>
          <div id="B:2" data-sf>
            <div>3 loading</div>
          </div>
          <div id="B:3" data-sf>
            <div>2 loading</div>
          </div>
          <div id="B:4" data-sf>
            <div>1 loading</div>
          </div>
        </div>

        {SuspenseScript}

        <template id="N:4" data-sr>
          1
        </template>
        <script id="S:4" data-ss>
          $RC(4)
        </script>
        <template id="N:3" data-sr>
          2
        </template>
        <script id="S:3" data-ss>
          $RC(3)
        </script>
        <template id="N:2" data-sr>
          3
        </template>
        <script id="S:2" data-ss>
          $RC(2)
        </script>
        <template id="N:1" data-sr>
          4
        </template>
        <script id="S:1" data-ss>
          $RC(1)
        </script>
      </>,

      <>
        <div>
          <div id="B:1" data-sf>
            <div>7 loading</div>
          </div>
          <div id="B:2" data-sf>
            <div>6 loading</div>
          </div>
          <div id="B:3" data-sf>
            <div>5 loading</div>
          </div>
          <div id="B:4" data-sf>
            <div>4 loading</div>
          </div>
          <div id="B:5" data-sf>
            <div>3 loading</div>
          </div>
          <div id="B:6" data-sf>
            <div>2 loading</div>
          </div>
          <div id="B:7" data-sf>
            <div>1 loading</div>
          </div>
        </div>

        {SuspenseScript}

        <template id="N:7" data-sr>
          1
        </template>
        <script id="S:7" data-ss>
          $RC(7)
        </script>
        <template id="N:6" data-sr>
          2
        </template>
        <script id="S:6" data-ss>
          $RC(6)
        </script>
        <template id="N:5" data-sr>
          3
        </template>
        <script id="S:5" data-ss>
          $RC(5)
        </script>
        <template id="N:4" data-sr>
          4
        </template>
        <script id="S:4" data-ss>
          $RC(4)
        </script>
        <template id="N:3" data-sr>
          5
        </template>
        <script id="S:3" data-ss>
          $RC(3)
        </script>
        <template id="N:2" data-sr>
          6
        </template>
        <script id="S:2" data-ss>
          $RC(2)
        </script>
        <template id="N:1" data-sr>
          7
        </template>
        <script id="S:1" data-ss>
          $RC(1)
        </script>
      </>
    ])
  })

  it('ensures autoScript works', async () => {
    // Sync does not needs autoScript
    assert.equal(
      await renderToString((r) => (
        <Suspense rid={r} fallback={<div>1</div>}>
          <div>2</div>
        </Suspense>
      )),
      <div>2</div>
    )

    // Async renders SuspenseScript
    assert.equal(
      await renderToString((r) => (
        <Suspense rid={r} fallback={<div>1</div>}>
          {Promise.resolve(<div>2</div>)}
        </Suspense>
      )),
      <>
        <div id="B:1" data-sf>
          <div>1</div>
        </div>

        {SuspenseScript}

        <template id="N:1" data-sr>
          <div>2</div>
        </template>
        <script id="S:1" data-ss>
          $RC(1)
        </script>
      </>
    )

    // Disable autoScript
    SUSPENSE_ROOT.autoScript = false

    // Async renders SuspenseScript
    assert.equal(
      await renderToString((r) => (
        <Suspense rid={r} fallback={<div>1</div>}>
          {Promise.resolve(<div>2</div>)}
        </Suspense>
      )),
      <>
        <div id="B:1" data-sf>
          <div>1</div>
        </div>
        <template id="N:1" data-sr>
          <div>2</div>
        </template>
        <script id="S:1" data-ss>
          $RC(1)
        </script>
      </>
    )
  })

  test('renderToStream', async () => {
    const stream = renderToStream((r) => (
      <div>
        <Suspense rid={r} fallback={<div>2</div>}>
          {Promise.resolve(<div>1</div>)}
        </Suspense>
      </div>
    ))

    assert(stream.readable)

    // emits end event
    const fn = mock.fn()
    stream.on('end', fn)

    const chunks = []

    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    assert.equal(fn.mock.calls.length, 1)
    assert.equal(chunks.length, 2)

    assert.equal(
      chunks[0].toString(),
      <div>
        <div id="B:1" data-sf>
          <div>2</div>
        </div>
      </div>
    )

    assert.equal(
      chunks[1].toString(),
      <>
        {SuspenseScript}
        <template id="N:1" data-sr>
          <div>1</div>
        </template>
        <script id="S:1" data-ss>
          $RC(1)
        </script>
      </>
    )
  })
})

describe('Suspense errors', () => {
  it('Throws when called outside of renderToStream', () => {
    assert.throws(
      () => (
        <>
          <Suspense rid={1} fallback={<div>loading</div>}>
            <div>1</div>
          </Suspense>
        </>
      ),
      /Cannot use Suspense outside of a `renderToStream` call./
    )
  })

  it('tests sync errors are thrown', () => {
    assert.throws(() => {
      renderToStream((r) => (
        <Suspense rid={r} fallback={<div>fallback</div>}>
          <Throw />
        </Suspense>
      ))
    }, /test/)
  })

  it('test sync errors after suspense', () => {
    try {
      renderToStream((r) => (
        <div>
          {/* Throws after suspense registration */}
          <Suspense rid={r} fallback={<div>fallback</div>}>
            {setTimeout(50).then(() => (
              <div>1</div>
            ))}
          </Suspense>

          <div>
            <Throw />
          </div>
        </div>
      ))

      assert.fail('should throw')
    } catch (error: any) {
      assert.equal(error.message, 'test')
    }
  })

  it('tests suspense without error boundary', async () => {
    const err = new Error('component failed')

    try {
      await renderToString((r) => (
        <Suspense rid={r} fallback={<div>1</div>}>
          {Promise.reject(err)}
        </Suspense>
      ))

      assert.fail('should throw')
    } catch (error) {
      assert.equal(error, err)
    }
  })

  it('tests stream suspense without error boundary', async () => {
    const err = new Error('component failed')

    const stream = renderToStream((r) => (
      <Suspense rid={r} fallback={<div>1</div>}>
        {Promise.reject(err)}
      </Suspense>
    ))

    try {
      for await (const data of stream) {
        // Second stream would be the suspense result, which errors out
        assert.equal(
          data.toString(),
          <div id="B:1" data-sf>
            <div>1</div>
          </div>
        )
      }

      assert.fail('should throw')
    } catch (error) {
      assert.equal(error, err)
    }
  })

  it('tests suspense with function error boundary', async () => {
    const err = new Error('component failed')

    // Sync does not needs autoScript
    assert.equal(
      await renderToString((r) => (
        <Suspense
          rid={r}
          fallback={<div>1</div>}
          catch={(err2) => {
            assert.equal(err2, err)

            return <div>3</div>
          }}>
          {Promise.reject(err)}
        </Suspense>
      )),
      <>
        <div id="B:1" data-sf>
          <div>1</div>
        </div>

        {SuspenseScript}
        <template id="N:1" data-sr>
          <div>3</div>
        </template>
        <script id="S:1" data-ss>
          $RC(1)
        </script>
      </>
    )
  })
})
