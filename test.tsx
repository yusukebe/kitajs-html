import http from 'http'
import { setTimeout } from 'timers/promises'
import Html from './index'
import { Suspense, renderToStream } from './suspense'

async function WaitFor({ s }: { s: number }) {
  await setTimeout(Number(s) * 1000)
  return <div>Loaded after: {s}s</div>
}

function render(rid: number) {
  return (
    <>
      <div>Hello</div>

      <Suspense rid={rid} fallback={<div>loading 2s</div>}>
        <div style="color: red">
          <WaitFor s={1} />
        </div>
        <div style="color: red">
          <WaitFor s={1} />
        </div>
      </Suspense>

      <div>World</div>

      <Suspense rid={rid} fallback={<div>loading 3s</div>}>
        <div style="color: green">
          <WaitFor s={3} />
        </div>
        <div style="color: green">
          <WaitFor s={3} />
        </div>
      </Suspense>

      <div>World</div>

      <Suspense rid={rid} fallback={<div>loading 2s</div>}>
        <div style="color: blue">
          <WaitFor s={2} />
        </div>
        <div style="color: blue">
          <WaitFor s={2} />
        </div>
      </Suspense>

      <div>World</div>

      <Suspense rid={rid} fallback={<div>loading random</div>}>
        <div style="color: green">
          <WaitFor s={3} />
        </div>
        <div style="color: green">
          <WaitFor s={4.5} />
        </div>
      </Suspense>

      <div>World</div>
    </>
  )
}

setInterval(() => {
  console.log(SUSPENSE_ROOT)
}, 500)

http
  .createServer((req, res) => {
    if (req.url === '/') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      renderToStream(render).pipe(res)
      return
    }

    // Ends the response manually
    res.end()
  })
  .listen(8080, () => {
    console.log('http://localhost:8080')
  })
