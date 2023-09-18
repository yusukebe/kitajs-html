import { createWriteStream } from 'fs'
import { MdnHomepage } from './renderers/mdn-homepage'
import { bench } from './suite'
import { HelloWorld } from './renderers/hello-world'
import { ManyProps } from './renderers/many-props'
import { ManyComponents } from './renderers/many-components'

function toMdRow(values: string[]) {
  return '| ' + values.join(' | ') + ' |'
}

;(async () => {
  const out = createWriteStream('benchmark.md', {
    mode: 0o644,
    flags: 'w'
  })

  out.write('# Benchmark\n\n')

  out.write('- ' + new Date().toISOString() + '\n')
  out.write('- Node: ' + process.version + '\n')
  out.write('- V8: ' + process.versions.v8 + '\n')
  out.write('- OS: ' + process.platform + '\n')
  out.write('- Arch: ' + process.arch + '\n')
  out.write('\n')

  for (const [name, fn] of [
    ['Hello World', HelloWorld],
    ['Mdn Homepage', MdnHomepage],
    ['Many Props', ManyProps],
    ['Many Components', ManyComponents]
  ] as const) {
    out.write('## ' + name + '\n\n')

    let start = true

    for (const runs of [10, 10_000, 100_000]) {
      console.log(name, runs)

      const res = bench(name, runs, fn)

      if (start) {
        out.write(toMdRow(Object.keys(res)) + '\n')
        out.write(toMdRow(Object.keys(res).fill('-')) + '\n')
        start = false
      }

      out.write(toMdRow(Object.values(bench(name, runs, fn))) + '\n')

      await new Promise((resolve) => setTimeout(resolve, 1000))
      gc!()
    }

    out.write('\n')
  }
})().catch(console.error)
