import { round, run } from './math';

/** Runs the benchmark for all the given functions */
export function runBenchmark(runs: number, imports: (() => void)[]) {
  let results = {} as Record<string, string>;

  // warms up the JIT
  for (const imp of imports) {
    run(100, imp);
  }

  // Prevents the GC from running in the middle of the benchmark
  gc!();

  for (const imp of imports) {
    results[imp.name] = `${round(run(runs, imp))}ms`;
  }

  results['faster'] = Object.entries(results)
    .sort((a, b) => parseFloat(String(a[1])) - parseFloat(String(b[1])))[0]
    ?.toString()!;

  return results;
}
