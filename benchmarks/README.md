# Benchmark

The `RealWorldPage` benchmark is the most meaningful since it represents a realistic
workload scenario. _Other benchmarks serve specific purposes, such as measuring the speed
of creating individual elements or handling attribute injection and escaping._

It's essential to emphasize that all benchmarks aim for impartiality. Any perceived bias
towards a particular library should be promptly reported, and corrective actions will be
taken swiftly.

We are committed to addressing any discrepancies or unfairness in the benchmarks promptly.
Updates reflecting corrections will be publicly shared as soon as they are available.

Feel free to reach out if you have any concerns or suggestions for improving the
benchmarking process. Your feedback is invaluable in ensuring the fairness and accuracy of
our comparisons.

Also, feel free to contribute benchmarks for any library you're interested in by opening a
pull request (PR). If you need assistance or wish to suggest a library for benchmarking,
don't hesitate to open an issue.

## Benchmark Results

```s
cpu: 13th Gen Intel(R) Core(TM) i5-13600K
runtime: node v20.11.0 (x64-linux)

benchmark        time (avg)             (min … max)       p75       p99      p999
--------------------------------------------------- -----------------------------
• Many Components (31.4kb)
--------------------------------------------------- -----------------------------
KitaJS/Html     120 µs/iter    (71'126 ns … 755 µs)    118 µs    417 µs    685 µs
Typed Html      714 µs/iter     (620 µs … 1'171 µs)    736 µs  1'070 µs  1'171 µs
VHtml         2'142 µs/iter   (1'942 µs … 2'705 µs)  2'257 µs  2'647 µs  2'705 µs
React         4'488 µs/iter   (4'242 µs … 5'025 µs)  4'612 µs  4'999 µs  5'025 µs
Common Tags   2'747 µs/iter   (2'493 µs … 4'639 µs)  2'832 µs  3'356 µs  4'639 µs
Ghtml           765 µs/iter     (677 µs … 1'371 µs)    774 µs  1'135 µs  1'371 µs

summary for Many Components (31.4kb)
  KitaJS/Html
   5.96x faster than Typed Html
   6.39x faster than Ghtml
   17.87x faster than VHtml
   22.93x faster than Common Tags
   37.45x faster than React

• Many Props (7.4kb)
--------------------------------------------------- -----------------------------
KitaJS/Html  17'856 ns/iter    (15'394 ns … 552 µs) 16'779 ns 40'678 ns    294 µs
Typed Html   73'914 ns/iter    (64'472 ns … 587 µs) 69'672 ns    265 µs    480 µs
VHtml        77'348 ns/iter    (69'187 ns … 678 µs) 73'025 ns    207 µs    491 µs
React        67'160 ns/iter    (56'875 ns … 642 µs) 62'871 ns    231 µs    485 µs
Common Tags  41'257 ns/iter    (36'495 ns … 620 µs) 39'047 ns 93'601 ns    415 µs
Ghtml        41'301 ns/iter    (37'672 ns … 689 µs) 39'598 ns 80'722 ns    363 µs

summary for Many Props (7.4kb)
  KitaJS/Html
   2.31x faster than Common Tags
   2.31x faster than Ghtml
   3.76x faster than React
   4.14x faster than Typed Html
   4.33x faster than VHtml

• MdnHomepage (66.7Kb)
--------------------------------------------------- -----------------------------
KitaJS/Html     394 µs/iter     (296 µs … 1'720 µs)    367 µs  1'192 µs  1'581 µs
Typed Html    2'326 µs/iter   (1'807 µs … 4'986 µs)  2'468 µs  4'637 µs  4'986 µs
VHtml         2'411 µs/iter   (1'965 µs … 5'148 µs)  2'464 µs  5'009 µs  5'148 µs
React         6'832 µs/iter  (6'031 µs … 10'336 µs)  7'170 µs 10'336 µs 10'336 µs
Common Tags   2'932 µs/iter   (2'496 µs … 4'542 µs)  2'880 µs  4'452 µs  4'542 µs
Ghtml           421 µs/iter     (325 µs … 3'123 µs)    384 µs  2'548 µs  2'897 µs

summary for MdnHomepage (66.7Kb)
  KitaJS/Html
   1.07x faster than Ghtml
   5.91x faster than Typed Html
   6.12x faster than VHtml
   7.45x faster than Common Tags
   17.35x faster than React
```

## About KitaJS/Html

KitaJS/Html prioritizes performance while maintaining a user-friendly and intuitive API.
Its design ensures not only speed but also a seamless developer experience (DX). Since
this code may run on every request, its primary objective is speed, with a secondary focus
on maintaining developer productivity.

The library adheres to the JSX standard for its API, shielding users from the complexities
of its internal workings. This approach allows us to optimize the underlying
implementation extensively, including function inlining, to achieve maximum performance.

## Runtime Inconsistencies

I tried multiple formatters and minifiers to ensure the html output of all runtimes is
consistent, however vhtml and common-tags aren't consistent at all, with weird behaviors
like adding spaces between components and rendering `0` as an empty string...

As react is by far the JSX standard these days, **KitaJS/Html is only required to produce
the same output as ReactDOMServer.renderToStaticMarkup**.

To be sure we are emitting a similar output and none of the libraries are emitting broken
HTML, a realWorldPage is rendered and stored at the [samples](./runner/samples) directory.
