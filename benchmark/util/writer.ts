import { createWriteStream } from 'fs'
import { runBenchmark } from './runner'

function toMdRow(values: string[]) {
  return '| ' + values.join(' | ') + ' |'
}

type Jsx = { createElement: Function; name: string }

export async function startBenchmark(
  filename: string,
  tests: ((c: Jsx, name: string) => void)[],
  candidates: Jsx[]
) {
  const stream = createWriteStream(filename, {
    mode: 0o644,
    flags: 'w'
  })

  stream.write('# Benchmark\n\n')
  stream.write('- ' + new Date().toISOString() + '\n')
  stream.write('- Node: ' + process.version + '\n')
  stream.write('- V8: ' + process.versions.v8 + '\n')
  stream.write('- OS: ' + process.platform + '\n')
  stream.write('- Arch: ' + process.arch + '\n')
  stream.write('\n')

  for (const fn of tests) {
    stream.write('## ' + fn.name + '\n\n')

    let headersWritten = false

    const tests = candidates.map((candidate) => {
      function test() {
        return fn(candidate, fn.name)
      }

      Object.defineProperty(test, 'name', {
        value: candidate.name,
        configurable: true
      })

      return test
    })

    for (const runs of [10, 10_000, 100_000]) {
      console.log(`Running ${fn.name} ${runs} times...`)

      const result = runBenchmark(runs, tests)

      if (!headersWritten) {
        stream.write(toMdRow(Object.keys(result)) + '\n')
        stream.write(toMdRow(Object.keys(result).fill('-')) + '\n')
        headersWritten = true
      }

      stream.write(toMdRow(Object.values(result)) + '\n')

      //  A second to let the event loop do its thing
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    stream.write('\n')
  }

  return new Promise((res) => stream.close(res))
}
