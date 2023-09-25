import { createWriteStream } from 'fs';
import { runBenchmark } from './runner';

function toMdRow(values: string[]) {
  return '| ' + values.join(' | ') + ' |';
}

type Jsx = { createElement: Function; name: string };

export async function startBenchmark(
  filename: string,
  tests: ((c: Jsx, name: string) => void)[],
  candidates: Jsx[]
) {
  const stream = createWriteStream(filename, {
    mode: 0o644,
    flags: 'w'
  });

  write('# Benchmark\n\n');
  write('- ' + new Date().toISOString() + '\n');
  write('- Node: ' + process.version + '\n');
  write('- V8: ' + process.versions.v8 + '\n');
  write('- OS: ' + process.platform + '\n');
  write('- Arch: ' + process.arch + '\n');
  write('\n');

  function write(str = ``) {
    stream.write(str.trim() + '\n');
    console.log(str);
  }

  for (const fn of tests) {
    write('## ' + fn.name + '\n\n');

    let headersWritten = false;

    const tests = candidates.map((candidate) => {
      function test() {
        return fn(candidate, fn.name);
      }

      Object.defineProperty(test, 'name', {
        value: candidate.name,
        configurable: true
      });

      return test;
    });

    for (const runs of [10, 10_000, 100_000]) {
      const result = runBenchmark(runs, tests);

      if (!headersWritten) {
        write(toMdRow(Object.keys(result)));
        write(toMdRow(Object.keys(result).fill('-')));
        headersWritten = true;
      }

      write(toMdRow(Object.values(result)));

      //  A second to let the event loop do its thing
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    write('\n');
  }

  return new Promise((res) => stream.close(res));
}
