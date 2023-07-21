# @kitajs/html

Build HTML string templates blazingly fast. Type safe using plain TypeScript with a minimal runtime footprint. No need to learn a template language, if you know TypeScript, you're set.

This:

```tsx
const item = 'item'
const icon = 'icon-add'

const list: string = (
  <ul>
    <li>{item}</li>
  </ul>
)

const button: string = (
  <button onclick="handleClick">
    <i class={icon}></i>
  </button>
)

console.log(list)
console.log(button)
```

Prints:

```html
<ul>
  <li>item</li>
</ul>

<button onclick="handleClick">
  <i class="icon-add"></i>
</button>
```

## Getting started

Install:

```bash
npm install --save @kitajs/html
```

Configure your TypeScript compiler for JSX:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "reactNamespace": "html"
  }
}
```

> Note: Always remember to add a import html from '@kitajs/html' in the top of your file.

Although we're configuring the compiler to use [React](https://facebook.github.io/react), this is not what is being used.
Instead, we redirect all jsx element to this library `html.createElement`.

Now create a \*.ts**x** file. For example: `example.tsx` with the following content:

```tsx
import html from '@kitajs/html'

const w = 'world'
const helloWorld: string = (
  <p>
    Hello <strong>{w}</strong>
  </p>
)
```

However, the following piece of code will **NOT** compile:

```tsx
;<foo></foo> // => Error: Property 'foo' does not exist on type 'JSX.IntrinsicElements'.
;<a foo="bar"></a> // => Error:  Property 'foo' does not exist on type 'HtmlAnchorTag'
```

## Performance

This, overall, is already a super fast "string builder" package, but you can use the compile method to get even faster speeds.

```tsx
const html = html.compile<['var', 'colorTheme']>(
  <>
    <div>$var</div>
    <div class="$colorTheme">2</div>
  </>
)

console.log(html({ var: '1', colorTheme: 'dark' }))
```

which prints:

```html
<div>1</div>
<div class="dark">2</div>
```

## Fragments

You can group tags using a simple fragment:

```tsx
const html = (
  <>
    <div>1</div>
    <div>2</div>
  </>
)
```

## Sanitization

Security is _NOT_ a feature. This library does _NOT_ sanitize.

```ts
const script = '<script>alert("hacked!")</script>'
const body = <body>{script}</body>
```

Will result in:

```html
<body>
  <script>
    alert('hacked!')
  </script>
</body>
```

If you need sanitization, you can use something like [sanitize-html](https://www.npmjs.com/package/sanitize-html).

## Supported HTML

All HTML elements and attributes are supported, except for the [svg](https://www.w3.org/TR/SVG/).

- Supported html elements: https://dev.w3.org/html5/html-author/#the-elements
- Supported html events: http://htmlcss.wikia.com/wiki/HTML5_Event_Attributes

Missing an element or attribute? Please create an issue or a PR to add it. It's easy to add.

### Attribute types

All HTML attributes support a string value, however some attributes also support a [`number`](https://www.w3.org/TR/html51/infrastructure.html#numbers), [`Date`](https://www.w3.org/TR/html51/infrastructure.html#dates-and-times) or [`boolean`](https://www.w3.org/TR/html51/infrastructure.html#sec-boolean-attributes)(or absent value) type:

```typescript
;<meter value={1} min={0} max={5} low={1} high={4} optimum={3}></meter>
// => <meter value="1" min="0" max="5" low="1" high="4" optimum="3"></meter>
;<ol start={3}></ol>
;<progress value={3} max={4}></progress>
;<td colspan={3} rowspan={3}></td>
;<th colspan={3} rowspan={3}></th>

const date = new Date('1914-12-20T08:00')
;<time datetime={date}></time>
// => <time datetime="1914-12-20T08:00:00.000Z"></time>
;<ins datetime={date}>updated</ins>
;<del datetime={date}>old</del>

// => <form> <input type="checkbox" checked> </form>
;<form novalidate={false}>
  <input type="checkbox" checked disabled={false}></input>
</form>
```

### Kebab case

As a browser is case insensitive when it comes to element and attribute names, it is common practice to use [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles) for this. However `<custom-element></custom-element>` is not allowed in TypeScript. Therefore we will transform `<customElement></customElement>` to `<custom-element></custom-element>`.

This transformation also works for custom attributes you define on a custom element yourself. For example:

```typescript
<customElement aCustomAttr="value"></customElement>
```

Becomes

```html
<custom-element a-custom-attr="value"></custom-element>
```

## How this all works

The way this works is by using TypeScript's jsx support, but not for jsx/react interoperability. Instead, it defines the _normal_ html tags as `IntrinsicElements` in the JSX namespace.

At runtime, the `html.createElement` function is called for every html tag. It simply converts the given element to a string with minimal overhead.

This:

```typescript
<ol start={2}>
  {[1, 2].map((i) => (
    <li>{i}</li>
  ))}
</ol>
```

Compiles to:

```javascript
html.createElement(
  'ol',
  { start: 2 },
  [1, 2].map(function (li) {
    return html.createElement('li', null, li)
  })
)
```

Which translates to:

```html
<ol start="2">
  <li>1</li>
  <li>2</li>
</ol>
```
