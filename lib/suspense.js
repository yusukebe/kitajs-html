const Html = require('../index')
const { PassThrough } = require('stream')

/**
 * @type {import('./suspense').Suspense}
 */
module.exports.Suspense = function (props) {
  // fallback may be async.
  const fallback = Html.contentsToString([props.fallback])

  if (!props.children) {
    return fallback
  }

  const children = Html.contentsToString([props.children])

  // Returns content if it's not a promise
  if (typeof children === 'string') {
    return children
  }

  /** Suspense id */
  let sid = 1

  // Keeps track of how many Suspense components are pending
  if (!module.exports.Suspense.pending[props.rid]) {
    sid = module.exports.Suspense.pending[props.rid] = 1
  } else {
    sid = module.exports.Suspense.pending[props.rid]++
  }

  children.then(function handler(result) {
    // Keeps track of how many Suspense components are pending
    // @ts-expect-error - undefined safe
    if (module.exports.Suspense.pending[props.rid] > 1) {
      module.exports.Suspense.pending[props.rid]--
    } else {
      delete module.exports.Suspense.pending[props.rid]
    }

    // Sends the hydrated HTML to the client
    module.exports.Suspense.hydrate(
      props.rid,
      `<template id="N:${sid}" data-replace>${result}</template><script>$RC("N:${sid}", "B:${sid}");</script>`
    )
  })

  // Keeps string return type
  if (typeof fallback === 'string') {
    return `<div id="B:${sid}" data-fallback>${fallback}</div>`
  }

  return fallback.then(
    (fallback) => `<div id="B:${sid}" data-fallback>${fallback}</div>`
  )
}

module.exports.Suspense.pending = Object.create(null)

//@ts-expect-error - first definition
module.exports.Suspense.Script = `<script>function $RC(ni,oi){let n=document.querySelector(\`template[id="\${ni}"][data-replace]\`);let o=document.querySelector(\`div[id="\${oi}"][data-fallback]\`);if(!n||!o)return;let f=document.createDocumentFragment();while(n.content.firstChild){f.appendChild(n.content.firstChild)}o.parentNode.replaceChild(f,o);n.remove()}</script>`

let ids = 1
/** @type {Map<number, import('stream').Writable>} */
const handler = new Map()

/**
 * @param {number} rid
 * @param {string} html
 */
module.exports.Suspense.hydrate = function hydrate(rid, html) {
  const res = handler.get(rid)

  if (!res) {
    throw new Error(
      `Could not find the stream for the provided resource ID: ${rid}. Probably the stream was already closed.`
    )
  }

  // Writes the chunk
  res.write(html)

  // Last chunk
  if (module.exports.Suspense.pending[rid] === undefined) {
    res.end()
    handler.delete(rid)
  }
}

/**
 * @param {(rid: number) => string | Promise<string>} factory
 * @type {import('./suspense').Suspense.renderToStream}
 */
module.exports.Suspense.renderToStream = function renderToStream(factory) {
  const stream = new PassThrough()

  const rid = ids++

  // Avoids overflow
  if (rid === Number.MAX_SAFE_INTEGER) {
    ids = 1
  }

  handler.set(rid, stream)

  const html = factory(rid)

  if (typeof html === 'string') {
    stream.write(html)

    // Did not have any Suspense component,
    if (module.exports.Suspense.pending[rid] === undefined) {
      stream.end()
      handler.delete(rid)
    }

    return stream
  }

  html
    // Pipes the promise to the stream
    .then((html) => {
      stream.write(html)

      // Did not have any Suspense component,
      if (module.exports.Suspense.pending[rid] === undefined) {
        handler.delete(rid)
        stream.end()
      }
    })
    .catch(console.error)

  return stream
}
