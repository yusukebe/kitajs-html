import Kita from '../index'
import { round, run } from './util/math'
// Avoids type-conflicts
const TypedHtml = require('typed-html')

export function bench(name: string, runs: number, fn: Function) {
  const compiled = Kita.compile((p: { name: string }) => fn(Kita, p.name))

  function kita() {
    void fn(Kita, name)
  }

  function compiledKita() {
    void compiled({ name })
  }

  function typedHtml() {
    void fn(TypedHtml, name)
  }

  // warms up the JIT
  run(100, kita)
  run(100, compiledKita)
  run(100, typedHtml)

  // Prevents the GC from running in the middle of the benchmark
  gc!()

  const kitaTime = run(runs, kita)

  // Prevents the GC from running in the middle of the benchmark
  gc!()

  const typedHtmlTime = run(runs, typedHtml)

  // Prevents the GC from running in the middle of the benchmark
  gc!()

  const compiledKitaTime = run(runs, compiledKita)

  return {
    ['Runs']: `${runs}`,

    ['@kitajs/html']: `${round(kitaTime)}ms`,
    ['typed-html']: `${round(typedHtmlTime)}ms`,

    ['+']: `${round(typedHtmlTime / kitaTime, 2)}x`,

    ['.compile()']: `${round(compiledKitaTime)}ms`,

    ['+ / @kitajs/html']: `${round(kitaTime / compiledKitaTime, 2)}x`,
    ['+ / typed-html']: `${round(typedHtmlTime / compiledKitaTime, 2)}x`
  } as const
}
