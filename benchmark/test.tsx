import Html from '../index'
import { Suspense, Doctype } from '../components'
import { setTimeout } from 'timers/promises'
import http from 'http'

async function WaitFor({ s }: { s: number }) {
  await setTimeout(Number(s) * 1000)
  return <div>Loaded after: {s}s</div>
}

function render(rid: number) {
  return (
    <>
      <Doctype />
      <html>
        <head>{Suspense.Script}</head>
        <body>
          <div>Hello</div>

          {Array.from({ length: 10 }, (_, i) => (
            <>
              <Suspense rid={rid} fallback={<div>loading 1s</div>}>
                <div style="color: verde">
                  <WaitFor s={i*2} />
                </div>
              </Suspense>
            </>
          ))}

          {/* <Suspense rid={rid} fallback={<div>loading 1s</div>}>
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
          </Suspense> */}
        </body>
      </html>
    </>
  )
}

setInterval(() => {
  console.log(Suspense.pending)
}, 500)

http
  .createServer((req, res) => {
    if (req.url === '/') {
      Suspense.renderToStream(render).pipe(res)
      return
    }

    // Ends the response manually
    res.end()
  })
  .listen(8080)
  .on('listening', () => {
    console.log('http://localhost:8080')
  })
