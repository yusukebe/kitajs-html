<br />

[![Issues](https://img.shields.io/github/issues/kitajs/html?logo=github&label=Issues)](https://github.com/kitajs/html/issues)
[![Stars](https://img.shields.io/github/stars/kitajs/html?logo=github&label=Stars)](https://github.com/kitajs/html/stargazers)
[![License](https://img.shields.io/github/license/kitajs/html?logo=githu&label=License)](https://github.com/kitajs/html/blob/main/LICENSE)
[![Codecov](https://codecov.io/gh/kitajs/html/branch/main/graph/badge.svg?token=ML0KGCU0VM)](https://codecov.io/gh/kitajs/html)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Farthurfiorette%2Ftinylibs.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Farthurfiorette%2Ftinylibs?ref=badge_shield)
[![Join the chat at https://gitter.im/tinylibs-js-org/community](https://badges.gitter.im/tinylibs-js-org/community.svg)](https://gitter.im/tinylibs-js-org/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Speed Blazing](https://img.shields.io/badge/speed-blazing%20%F0%9F%94%A5-brightgreen.svg)](https://twitter.com/acdlite/status/974390255393505280)

[![Latest Version](https://img.shields.io/npm/v/@kitajs/html)](https://www.npmjs.com/package/@kitajs/html)
[![Downloads](https://img.shields.io/npm/dw/@kitajs/html)](https://www.npmjs.com/package/@kitajs/html)
[![JsDelivr](https://data.jsdelivr.com/v1/package/npm/@kitajs/html/badge?style=rounded)](https://www.jsdelivr.com/package/npm/@kitajs/html)
[![Bundlephobia](https://img.shields.io/bundlephobia/minzip/@kitajs/html/latest?style=flat)](https://bundlephobia.com/package/@kitajs/html@latest)
[![Packagephobia](https://packagephobia.com/badge?p=@kitajs/html@latest)](https://packagephobia.com/result?p=@kitajs/html@latest)

<br />

<div align="center">
  <pre>
  <h1>🏛️<br />KitaJS HTML</h1>
  </pre>
  <br />
</div>

<h3 align="center">
  <code>KitaJS HTML</code> is a 0 dependencies fast and concise HTML generator for JavaScript with JSX syntax.
  <br />
  <br />
</h3>

<br />

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Installing](#installing)
- [Getting Started](#getting-started)
- [Sanitization](#sanitization)
- [Compiling html](#compiling-html)
- [Fragments](#fragments)
- [Supported HTML](#supported-html)
- [Kebab case](#kebab-case)
- [Performance](#performance)
- [How it works](#how-it-works)

<br />

## Installing

```sh
npm install @kitajs/html # or yarn add @kitajs/html
```

<br />

## Getting Started

Install `@kitajs/html` with your favorite package manager, import it into the top of your `jsx`/`tsx` file and change your tsconfig.json to transpile jsx syntax.

```tsx
// index.tsx

// Always remember to import html from '@kitajs/html'
import html from '@kitajs/html'

console.log(<div>Hello World</div>)
```

```jsonc
// tsconfig.json

{
  "compilerOptions": {
    "jsx": "react",
    "reactNamespace": "html"
  }
}
```

This tells typescript to transpile all JSX syntax to calls to our `html.createElement` function.

This package just transpiles JSX to a HTML string, you can imagine doing something like this, but better:

```ts
// without @kitajs/html
const html = `<div> Hello World!<div>` ❌
```

```tsx
// with @kitajs/html
const html = (<div>Hello World!<div>) ✅
// Also results into a string, but with type checked.
```

<br />

## Sanitization

This package is a HTML builder, **_not an HTML sanitizer_**. This means that it does not sanitize any input, and you should sanitize where its needed. However, we escape all attribute values to avoid breaking out of the html attribute/tag.

```tsx
const script = '<script>alert("hacked!")</script>'

const html = (
  <>
    <div style={'"&<>\''}></div>
    <div>{script}</div>
  </>
)
```

Will result into this html below but **minified**:

```html
<!-- formatted html to make it easier to read -->
<div style="&quot;&amp;&lt;&gt;'"></div>
<div>
  <script>
    alert('hacked!')
  </script>
</div>
```

<br />

## Compiling html

When you have static html, is simple to get amazing performances, just save it to a constant and reuse it. However, if you need to hydrate the html with dynamic values in a super fast way, you can use the `compile` property to compile the html and reuse it later.

```tsx
import html from '@kitajs/html'

const compiled = html.compile<['param1', 'param2']>(
  <div>
    <div>$param1</div>
    <div>$param2</div>
    <div>$notFound</div>
  </div>
)

const html = compiled({ param1: 'Hello', param2: 'World!' })
// formatted html to make it easier to read
// <div>
//   <div>Hello</div>
//   <div>World!</div>
//   <div>$notFound</div>
// </div>
```

This makes the html generation almost [**_3000x_**](#performance) faster than just using jsx normally.

Variables that were not passed to the `compile` function are ignored **silently**, this way you can reuse the result into another `compile` function or just because the your _"`$val`"_ was supposed to be a static value.

<br />

## Fragments

JSX does not allow multiple root elements, but you can use a fragment to group multiple elements:

```tsx
const html = (
  <>
    <div>1</div>
    <div>2</div>
  </>
)
```

[Learn more about JSX syntax here!](https://react.dev/learn/writing-markup-with-jsx)

<br />

## Supported HTML

All HTML elements and attributes are supported, except for the [svg](https://www.w3.org/TR/SVG/).

- Supported html elements: https://dev.w3.org/html5/html-author/#the-elements
- Supported html events: http://htmlcss.wikia.com/wiki/HTML5_Event_Attributes

Missing an element or attribute? Please create an issue or a PR to add it. It's easy to add.

<br />

## Kebab case

HTML tags and attributes should be case insensitive, however JSX syntax does not allow `<kebab-case>` elements. Therefore we transform all `<camelCase>` tags into `<camel-case>` to allow usage of custom html tags.

This transformation also works for custom attributes you define on a custom element yourself. For example:

```tsx
<kebabCase kebabCase="value"></kebabCase>
```

Becomes

```html
<kebab-case kebab-case="value"></kebab-case>
```

Note, if you are using `Typescript`, you will have to extend `JSX` namespace to allow it:

```tsx
interface MathPower {
  myExponential: number
  // this property becomes the children type
  children: number
}

declare namespace JSX {
  interface IntrinsicElements {
    mathPower: MathPower
  }
}

const element = <mathPower myExponential={2}>{3}</mathPower>
// Becomes <math-power my-exponential="2">3</math-power>
```

<br />

## Performance

This package is just a string builder on steroids, as you can see [how this works](#how-it-works). However we are running a benchmark with an JSX HTML with about 10K characters to see how it performs.

You can run this yourself by running `pnpm bench`.

```java
@kitajs/html:
  13 604 ops/s, ±1.12%       | 99.97% slower

@kitajs/html - compiled:
  38 938 712 ops/s, ±2.49%   | fastest

typed-html:
  10 057 ops/s, ±1.78%       | slowest, 99.97% slower
```

<iframe src="benchmark/2023-07-22T19:45:17.300Z.chart.html" frameborder="0" scrolling="0" width="160px" height="30px"></iframe>

<br />

## How it works

This can be easily done by using Typescript's JSX support and changing the default `react` bindings to our own `html` namespace.

```tsx
<ol start={2}>
  {[1, 2].map((i) => (
    <li>{i}</li>
  ))}
</ol>
```

Is transpiled by typescript compiler at build step to:

```js
html.createElement(
  'ol',
  { start: 2 },
  [1, 2].map((i) => html.createElement('li', null, i))
)
```

Which results into this string:

```html
<ol start="2">
  <li>1</li>
  <li>2</li>
</ol>
```

<br />
