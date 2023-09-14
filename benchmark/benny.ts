import Kita from '../index'
import { BigComponent } from './renderers/big-component'
import { HelloWorld } from './renderers/hello-world'
import { ManyProps } from './renderers/many-props'
// Avoids type-conflicts
const TypedHtml = require('typed-html')
const benny = require('benny')

export function suite(name: string, fn: Function) {
  const compiled = Kita.compile<{ name: string }>((p) => fn(Kita, p.name))

  function kita() {
    return fn(Kita, name)
  }

  function compiledKita() {
    return compiled({ name })
  }

  function typedHtml() {
    return fn(TypedHtml, name)
  }

  // warms up the JIT
  for (let i = 0; i < 100; i++) {
    kita()
    compiledKita()
    typedHtml()
  }

  return benny.suite(
    `Html generation (${name})`,

    benny.add('@kitajs/html', kita),
    benny.add('@kitajs/html - compiled', compiledKita),
    benny.add('typed-html', typedHtml),

    benny.configure({
      cases: {
        minSamples: 100
        // minTime: 5
      }
    }),
    benny.cycle(),
    benny.complete()
  )
}

suite('Hello World', HelloWorld)
suite('Many Props', ManyProps)
suite('Big Component', BigComponent)
