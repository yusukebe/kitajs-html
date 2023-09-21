const { contentsToString } = require('./index')
const { PassThrough } = require('stream')

/**
 * @type {import('./suspense').SUSPENSE_ROOT}
 */
const SUSPENSE_ROOT = {
  pending: new Map(),
  handlers: new Map(),
  rid: 0
}

/**
 * @type {import('./suspense').SuspenseScript}
 */
const SuspenseScript = `
    <script>
      function $RC(ni,oi){
        let n=document.querySelector(\`template[id="\${ni}"][data-replace]\`);
        let o=document.querySelector(\`div[id="\${oi}"][data-fallback]\`);
        if(!n||!o)return;
        let f=document.createDocumentFragment();
        while(n.content.firstChild){
          f.appendChild(n.content.firstChild)
        }
        o.parentNode.replaceChild(f,o);
        n.remove()
      }
    </script>
    `.replace(/\n\s*/g, '')

/**
 * @type {import('./suspense').Suspense}
 */
function Suspense (props) {
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

  /** Suspense id */
  let sid = SUSPENSE_ROOT.pending.get(props.rid)

  // Keeps track of how many Suspense components are pending
  if (sid) {
    sid += 1
  } else {
    sid = 1
  }

  // Updates the pending Suspense components
  SUSPENSE_ROOT.pending.set(props.rid, sid)

  children
    .then(function writeStreamTemplate (result) {
      const handler = SUSPENSE_ROOT.handlers.get(props.rid)

      // Handler was cleared out previously, probably
      // because of a timeout/error.
      if (!handler) {
        return
      }

      const stream = handler.deref()

      // Stream was probably already closed/cleared out.
      // We can safely ignore this.
      if (!stream || stream.closed) {
        return
      }

      // Writes the chunk
      stream.write(
        `<template id="N:${sid}" data-replace>${result}</template><script>$RC("N:${sid}", "B:${sid}");</script>`
      )
    })
    .catch(function catchError (err) {
      // There's nothing we can do as this block is
      // executed asynchronously.
      console.error(err)
    })
    .finally(function removePending () {
      // Gets the last suspense id for this resource, so we can decrement it.
      const lastSuspenseId = SUSPENSE_ROOT.pending.get(props.rid)

      // Handler was cleared out previously, probably
      // because of a timeout/error.
      if (!lastSuspenseId) {
        return
      }

      // reduces current suspense id
      if (lastSuspenseId > 1) {
        SUSPENSE_ROOT.pending.set(props.rid, lastSuspenseId - 1)

        // Last suspense component, runs cleanup
      } else {
        SUSPENSE_ROOT.pending.delete(props.rid)

        const handler = SUSPENSE_ROOT.handlers.get(props.rid)

        if (handler) {
          const stream = handler.deref()

          if (stream) {
            stream.end()
          }

          // Removes the current handler
          SUSPENSE_ROOT.handlers.delete(props.rid)
        }
      }
    })

  // Keeps string return type
  if (typeof fallback === 'string') {
    return `<div id="B:${sid}" data-fallback>${fallback}</div>`
  }

  return fallback.then(
    (fallback) => `<div id="B:${sid}" data-fallback>${fallback}</div>`
  )
}

/**
 * @type {import('./suspense').renderToStream}
 */
function renderToStream (factory, customRid) {
  if (customRid && SUSPENSE_ROOT.handlers.has(customRid)) {
    throw new Error(`The provided resource ID is already in use: ${customRid}.`)
  }

  const rid = customRid || SUSPENSE_ROOT.rid++

  const stream = new PassThrough()
  SUSPENSE_ROOT.handlers.set(rid, new WeakRef(stream))

  let html

  try {
    html = factory(rid)
  } catch (renderError) {
    // Removes handlers and pending suspense components
    // before rethrowing the error.

    stream.end()
    SUSPENSE_ROOT.handlers.delete(rid)
    SUSPENSE_ROOT.pending.delete(rid)

    throw renderError
  }

  // root resolves to promise
  if (typeof html === 'string') {
    stream.write(html)

    // Did not had any suspense component in which
    // a async handler was called.
    if (!SUSPENSE_ROOT.pending.has(rid)) {
      stream.end()

      SUSPENSE_ROOT.pending.delete(rid)
      SUSPENSE_ROOT.handlers.delete(rid)
    }

    return stream
  }

  html
    .then(function writeStreamHtml (html) {
      stream.write(html)
    })
    .catch(function catchError (err) {
      // There's nothing we can do as this block is
      // executed asynchronously.
      console.error(err)
    })
    .finally(function endStream () {
      // Did not had any suspense component in which
      // a async handler was called.
      if (!SUSPENSE_ROOT.pending.has(rid)) {
        stream.end()

        SUSPENSE_ROOT.pending.delete(rid)
        SUSPENSE_ROOT.handlers.delete(rid)
      }
    })

  return stream
}

module.exports.Suspense = Suspense
module.exports.renderToStream = renderToStream
module.exports.SuspenseScript = SuspenseScript
module.exports.SUSPENSE_ROOT = SUSPENSE_ROOT
