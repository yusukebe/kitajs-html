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
function Suspense(props) {
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
    .then(function handler(result) {
      {
        const currentSid = SUSPENSE_ROOT.pending.get(props.rid)

        if (!currentSid) {
          throw new Error(
            `Could not find the stream for the provided resource ID: ${props.rid}. Probably the stream was already closed.`
          )
        }

        // Keeps track of how many Suspense components are pending
        if (currentSid <= 1) {
          SUSPENSE_ROOT.pending.delete(props.rid)
        } else {
          SUSPENSE_ROOT.pending.set(props.rid, currentSid - 1)
        }
      }

      const res = SUSPENSE_ROOT.handlers.get(props.rid)

      if (!res) {
        throw new Error(
          `Could not find the stream for the provided resource ID: ${props.rid}. Probably the stream was already closed.`
        )
      }

      const stream = res.deref()

      if (!stream) {
        throw new Error(
          `Could not find the stream for the provided resource ID: ${props.rid}. Probably the stream was already closed.`
        )
      }

      // Writes the chunk
      stream.write(
        `<template id="N:${sid}" data-replace>${result}</template><script>$RC("N:${sid}", "B:${sid}");</script>`
      )

      // Last chunk was written, closes the stream
      if (SUSPENSE_ROOT.pending.has(props.rid) === false) {
        stream.end()
        SUSPENSE_ROOT.handlers.delete(props.rid)
      }
    })
    .catch(console.error)

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
function renderToStream(factory, _rid) {
  if (_rid && SUSPENSE_ROOT.handlers.has(_rid)) {
    throw new Error(`The provided resource ID is already in use: ${_rid}.`)
  }

  const rid = _rid || SUSPENSE_ROOT.rid++

  const stream = new PassThrough()
  SUSPENSE_ROOT.handlers.set(rid, new WeakRef(stream))

  const html = factory(rid)

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
    .then(function asyncHandler(html) {
      stream.write(html)

      // Did not had any suspense component in which
      // a async handler was called.
      if (!SUSPENSE_ROOT.pending.has(rid)) {
        stream.end()

        SUSPENSE_ROOT.pending.delete(rid)
        SUSPENSE_ROOT.handlers.delete(rid)
      }
    })
    .catch(console.error)

  return stream
}

module.exports.Suspense = Suspense
module.exports.SuspenseScript = SuspenseScript
module.exports.renderToStream = renderToStream
module.exports.SUSPENSE_ROOT = SUSPENSE_ROOT
