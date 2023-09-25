export function run(amount: number, fn: Function) {
  const start = performance.now();

  for (let i = 0; i < amount; i++) {
    void fn();
  }

  return performance.now() - start;
}

export function round(num: number, n = 4) {
  const p = Math.pow(10, n);
  return Math.round(num * p) / p;
}
