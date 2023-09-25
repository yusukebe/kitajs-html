import http from 'http';
import { setTimeout } from 'timers/promises';
import Html from '../index';
import { Suspense, renderToStream } from '../suspense';

async function WaitFor({ s }: { s: number }) {
  await setTimeout(Number(s) * 1000);
  return <div>Loaded after: {s}s</div>;
}

function renderLayout(rid: number) {
  return (
    <html>
      <body>
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
      </body>
    </html>
  );
}

http
  .createServer((req, res): void => {
    // This simple webserver only has a index.html file
    if (req.url !== '/' && req.url !== '/index.html') {
      res.end();
      return;
    }

    // Charset utf8 is important to avoid old browsers utf7 xss attacks
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const stream = renderToStream(renderLayout);
    console.log(`[${stream.rid}] Rendering ${req.url}`);

    stream
      // Streaming stuff happens after first chunk (fallback) is sent
      .once('data', () => {
        stream.on('data', () => {
          console.log(`${stream.rid}> Streaming for ${req.url}`);
        });
      })
      .once('close', () => console.log(`<${stream.rid} Finished stream for ${req.url}`))
      .pipe(res);
  })
  .listen(8080, () => {
    console.log('Listening to http://localhost:8080');
  });
