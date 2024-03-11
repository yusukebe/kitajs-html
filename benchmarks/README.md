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
• Real World Scenario
--------------------------------------------------- -----------------------------
KitaJS/Html     408 µs/iter     (281 µs … 2'332 µs)    352 µs  1'508 µs  2'165 µs
Typed Html    2'415 µs/iter   (1'817 µs … 4'154 µs)  2'744 µs  3'915 µs  4'154 µs
VHtml         2'369 µs/iter   (1'969 µs … 3'918 µs)  2'561 µs  3'829 µs  3'918 µs
React JSX     6'839 µs/iter   (6'015 µs … 8'172 µs)  7'356 µs  8'172 µs  8'172 µs
Preact        1'391 µs/iter     (699 µs … 5'600 µs)  1'808 µs  4'336 µs  5'600 µs
React         7'451 µs/iter   (6'215 µs … 9'525 µs)  8'522 µs  9'525 µs  9'525 µs
Common Tags   3'189 µs/iter   (2'489 µs … 6'239 µs)  3'057 µs  5'891 µs  6'239 µs
Ghtml           479 µs/iter     (331 µs … 4'512 µs)    419 µs  3'825 µs  4'386 µs

summary for Real World Scenario
  KitaJS/Html
   1.17x faster than Ghtml
   3.41x faster than Preact
   5.8x faster than VHtml
   5.92x faster than Typed Html
   7.81x faster than Common Tags
   16.75x faster than React JSX
   18.25x faster than React

• Component Creation
--------------------------------------------------- -----------------------------
KitaJS/Html     536 µs/iter     (296 µs … 3'923 µs)    428 µs  2'849 µs  3'823 µs
Typed Html      995 µs/iter     (698 µs … 3'244 µs)    809 µs  2'941 µs  3'244 µs
VHtml         1'856 µs/iter   (1'400 µs … 4'045 µs)  1'863 µs  3'686 µs  4'045 µs
React JSX     9'971 µs/iter  (8'614 µs … 11'613 µs) 10'646 µs 11'613 µs 11'613 µs
Preact          675 µs/iter     (501 µs … 2'361 µs)    650 µs  1'597 µs  2'361 µs
React        10'117 µs/iter  (8'876 µs … 12'153 µs) 10'776 µs 12'153 µs 12'153 µs
Common Tags   1'879 µs/iter   (1'598 µs … 2'788 µs)  2'077 µs  2'682 µs  2'788 µs
Ghtml           610 µs/iter     (538 µs … 1'571 µs)    606 µs  1'277 µs  1'571 µs

summary for Component Creation
  KitaJS/Html
   1.14x faster than Ghtml
   1.26x faster than Preact
   1.86x faster than Typed Html
   3.47x faster than VHtml
   3.51x faster than Common Tags
   18.62x faster than React JSX
   18.89x faster than React

• Attributes Serialization
--------------------------------------------------- -----------------------------
KitaJS/Html  18'436 ns/iter    (15'586 ns … 771 µs) 17'064 ns 45'337 ns    428 µs
Typed Html   79'452 ns/iter    (67'563 ns … 798 µs) 72'533 ns    389 µs    676 µs
VHtml        79'088 ns/iter    (69'430 ns … 932 µs) 73'704 ns    226 µs    591 µs
React JSX    66'936 ns/iter    (55'916 ns … 718 µs) 61'919 ns    246 µs    594 µs
Preact       28'302 ns/iter    (22'978 ns … 934 µs) 25'721 ns 79'974 ns    483 µs
React        66'007 ns/iter    (56'003 ns … 723 µs) 61'095 ns    228 µs    577 µs
Common Tags  41'666 ns/iter    (36'105 ns … 741 µs) 39'027 ns    110 µs    481 µs
Ghtml        42'447 ns/iter    (37'887 ns … 702 µs) 40'037 ns    104 µs    441 µs

summary for Attributes Serialization
  KitaJS/Html
   1.54x faster than Preact
   2.26x faster than Common Tags
   2.3x faster than Ghtml
   3.58x faster than React
   3.63x faster than React JSX
   4.29x faster than VHtml
   4.31x faster than Typed Html
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
