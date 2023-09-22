const { contentsToString } = require('./index')
const { PassThrough } = require('stream')

/**
 * Simple replace child scripts to replace the template streamed by the server.
 *
 * As this script is the only residue of this package that is actually sent
 * to the client, it's important to keep it as small as possible and also
 * include the license to avoid legal issues.
 */
const SuspenseScript = /* html */ `
      <script>
        /* Apache-2.0 https://kita.js.org */
        function $RC(s){
          var d=document,
            q=d.querySelector.bind(d),
            n=q('template[id="N:'+s+'"][data-sr]'),
            o=q('div[id="B:'+s+'"][data-sf]'),
            f=d.createDocumentFragment(),
            g=q('script[id="S:'+s+'"][data-ss]'),
            c;

          if (n&&o){
            while(c=n.content.firstChild)
              f.appendChild(c);
            o.parentNode.replaceChild(f,o);
            n.remove()
          }

          g&&g.remove()
        }
      </script>
    `.replace(/\n\s*/g, '') // simply minification step

// Creates the suspense root if it doesn't exist
if (globalThis.SUSPENSE_ROOT === undefined) {
  globalThis.SUSPENSE_ROOT = {
    resources: new Map(),
    requestCounter: 1,
    enabled: false,
    autoScript: true
  }
}

/**
 * @type {import('./suspense').Suspense}
 */
function Suspense(props) {
  if (!SUSPENSE_ROOT.enabled) {
    throw new Error('Cannot use Suspense outside of a `renderToStream` call.')
  }

  // fallback may be async.
  const fallback = contentsToString([props.fallback])

  if (!props.children) {
    return fallback
  }

  const children = contentsToString([props.children])

  // Returns content if it's not a promise
  if (typeof children === 'string') {
    return children
  }

  let resource = SUSPENSE_ROOT.resources.get(props.rid)

  if (!resource) {
    throw new Error(
      'Suspense resource closed before all suspense components were resolved.'
    )
  }

  // Gets the current run number for this resource
  // Increments first so we can differ 0 as no suspenses
  // were used and 1 as the first suspense component
  const run = ++resource.running

  children
    .then(function writeStreamTemplate(result) {
      // Reloads the resource as it may have been closed
      resource = SUSPENSE_ROOT.resources.get(props.rid)

      if (!resource) {
        return
      }

      const stream = resource.stream.deref()

      // Stream was probably already closed/cleared out.
      // We can safely ignore this.
      if (!stream || stream.closed) {
        return
      }

      // Writes the suspense script if its the first
      // suspense component in this resource. This way following
      // templates+scripts can be executed
      if (SUSPENSE_ROOT.autoScript && resource.sent === false) {
        stream.write(SuspenseScript)
        resource.sent = true
      }

      // Writes the chunk
      stream.write(
        // prettier-ignore
        '<template id="N:' + run + '" data-sr>' + result + '</template><script id="S:' + run + '" data-ss>$RC(' + run + ')</script>'
      )
    })
    .catch(function writeStreamError(err) {
      // There's nothing we can do as this block is
      // executed asynchronously.
      console.error(err)
    })
    .finally(function resourceRemover() {
      // Reloads the resource as it may have been closed
      resource = SUSPENSE_ROOT.resources.get(props.rid)

      if (!resource) {
        return
      }

      // reduces current suspense id
      if (resource.running > 1) {
        resource.running -= 1

        // Last suspense component, runs cleanup
      } else {
        const stream = resource.stream.deref()

        if (stream) {
          stream.end()
        }

        // Removes the current state
        SUSPENSE_ROOT.resources.delete(props.rid)
      }
    })

  // Keeps string return type
  if (typeof fallback === 'string') {
    return '<div id="B:' + run + '" data-sf>' + fallback + '</div>'
  }

  return fallback.then(
    (resolved) => '<div id="B:' + run + '" data-sf>' + resolved + '</div>'
  )
}

/**
 * @type {import('./suspense').renderToStream}
 */
function renderToStream(factory, customRid) {
  // Enables suspense if it's not enabled yet
  if (SUSPENSE_ROOT.enabled === false) {
    SUSPENSE_ROOT.enabled = true
  }

  if (customRid && SUSPENSE_ROOT.resources.has(customRid)) {
    throw new Error(`The provided resource ID is already in use: ${customRid}.`)
  }

  const requestId = customRid || SUSPENSE_ROOT.requestCounter++
  const stream = new PassThrough()

  SUSPENSE_ROOT.resources.set(requestId, {
    stream: new WeakRef(stream),
    running: 0,
    sent: false
  })

  let html

  try {
    html = factory(requestId)
  } catch (renderError) {
    // Could not generate even the loading template.
    // This means a sync error was thrown and there's
    // nothing we can do unless closing the stream
    // and re-throwing the error.

    stream.end()
    SUSPENSE_ROOT.resources.delete(requestId)

    throw renderError
  }

  // root resolves to promise
  if (typeof html === 'string') {
    stream.write(html)

    const updatedResource = SUSPENSE_ROOT.resources.get(requestId)

    // This resource already resolved or no suspenses were used.
    if (!updatedResource || updatedResource.running === 0) {
      stream.end()
      SUSPENSE_ROOT.resources.delete(requestId)
    }

    return stream
  }

  html
    .then(function writeStreamHtml(html) {
      stream.write(html)
    })
    .catch(function catchError(err) {
      // There's nothing we can do as this block is
      // executed asynchronously.
      console.error(err)
    })
    .finally(function endStream() {
      const updatedResource = SUSPENSE_ROOT.resources.get(requestId)

      // This resource already resolved or no suspenses were used.
      if (!updatedResource || updatedResource.running === 0) {
        stream.end()
        SUSPENSE_ROOT.resources.delete(requestId)
      }
    })

  return stream
}

/**
 * @type {import('./suspense').renderToString}
 */
async function renderToString(factory, customRid) {
  const stream = renderToStream(factory, customRid)

  /** @type {Buffer[]} */
  const chunks = []

  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk))
  }

  return Buffer.concat(chunks).toString('utf-8')
}

module.exports.Suspense = Suspense
module.exports.renderToStream = renderToStream
module.exports.renderToString = renderToString
module.exports.SuspenseScript = SuspenseScript
