<br />

[![Issues](https://img.shields.io/github/issues/kitajs/html?logo=github&label=Issues)](https://github.com/kitajs/html/issues)
[![Stars](https://img.shields.io/github/stars/kitajs/html?logo=github&label=Stars)](https://github.com/kitajs/html/stargazers)
[![License](https://img.shields.io/github/license/kitajs/html?logo=githu&label=License)](https://github.com/kitajs/html/blob/master/LICENSE)
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
  <code>KitaJS HTML</code> is a no dependencies, fast and concise HTML generator for JavaScript with JSX syntax.
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
- [Extending types](#extending-types)
- [Performance](#performance)
- [How it works](#how-it-works)
- [Fork credits](#fork-credits)

<br />

## Installing

```sh
npm install @kitajs/html # or yarn add @kitajs/html
```

<br />

## Getting Started

Install `@kitajs/html` with your favorite package manager, import it into the top of your `jsx`/`tsx` file and change your tsconfig.json to transpile jsx syntax.

```jsonc
// tsconfig.json

{
  "compilerOptions": {
    "jsx": "react",
    "reactNamespace": "html"
  }
}
```

```tsx
// Always remember to import html from '@kitajs/html'
import html from '@kitajs/html'

// Using as a simple html builder
console.log(<div>Hello World</div>) // '<div>Hello World</div>'

// Maybe your own server-side html api
function route(request, response) {
  return response
    .header('Content-Type', 'text/html')
    .send(<div>Hello World</div>)
}

// Maybe in a static html file
fs.writeFileSync(
  'index.html',
  <html>
    <head>
      <title>Hello World</title>
    </head>
    <body>
      <div>Hello World</div>
    </body>
  </html>
)

// Also as a component library
function Layout({ name, children }: html.PropsWithChildren<{ name: string }>) {
  return (
    <html>
      <head>
        <title>Hello World</title>
      </head>
      <body>
        <div>Hello {name}</div>
        {children}
      </body>
    </html>
  )
}

console.log(<Layout name="World">I'm in the body!</Layout>)

// Anywhere you want! All JSX becomes a string
typeof (<div>Hello World</div>) === 'string'
```

This package just provides functions to transpile JSX to a HTML string, you can imagine doing something like this before, but now with type checking and intellisense:

```ts
// without @kitajs/html
const html = `<div> Hello World!<div>` ❌
```

```tsx
// with @kitajs/html
const html = <div>Hello World!<div> ✅
// Also results into a string, but with type checks.
```

<br />

## Sanitization

This package is a HTML builder, **_not an HTML sanitizer_**. This means that it does not sanitize any input, and you should sanitize where its needed. However, we escape all attribute values to avoid breaking out of the html attribute/tag.

```tsx
const script = '<script>alert("hacked!")</script>'

const html = (
  <>
    <div style={'"&<>\''}></div>
    <div style={{ backgroundColor: '"&<>\'' }}></div>
    <div>{script}</div>
  </>
)
```

Will result into this html below but **minified**:

```html
<!-- formatted html to make it easier to read -->
<div style="&quot;&amp;&lt;&gt;'"></div>
<div style="background-color:&quot;&amp;&lt;&gt;;'"></div>
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

<br />

## Extending types

Just as exemplified above, you may also want to add custom properties to your elements. You can do this by extending the `JSX` namespace.

> ⚠️ Please follow the JSX convention and do not use `kebab-case` for your properties, use `camelCase` instead. We internally transform all `camelCase` properties to `kebab-case` to be compliant with the HTML and JSX standards.

```tsx
declare namespace JSX {
  // Declares a new element properties and children type
  interface MathPower {
    // Changes properties to the math-power element
    myExponential: number
    // this property becomes the children type
    children: number
  }

  // Adds a new element
  interface IntrinsicElements {
    mathPower: MathPower
  }

  // Adds properties to all elements
  interface HtmlTag {
    hxBoost: boolean
  }
}

const element = (
  <mathPower myExponential={2} hxBoost>
    {3}
  </mathPower>
)
// Becomes <math-power my-exponential="2" hx-boost>3</math-power>
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

<br />

## How it works

This can be easily done by using TypeScript's JSX support and changing the default `react` bindings to our own `html` namespace.

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

## Fork credits

This repository was initially forked from [typed-html](https://github.com/nicojs/typed-html) and modified to add some features and increase performance.

Initial credits to [nicojs](https://github.com/nicojs) and [contributors](https://github.com/nicojs/typed-html/graphs/contributors) for the amazing work.

Licensed under the [Apache License, Version 2.0](LICENSE).

<br />
