/// <reference path="./jsx.d.ts" />

const ESCAPED_REGEX = /[<"'&]/
const CAMEL_REGEX = /[a-z][A-Z]/

/**
 * @type {typeof import('.').Fragment}
 */
const Fragment = Symbol.for('kHtmlFragment')

/**
 * @type {import('.').isUpper}
 */
function isUpper (input, index) {
  const code = input.charCodeAt(index)
  return code >= 65 /* A */ && code <= 90 /* Z */
}

/**
 * @type {import('.').toKebabCase}
 */
function toKebabCase (camel) {
  // This is a optimization to avoid the whole conversion process when the
  // string does not contain any uppercase characters.
  if (!CAMEL_REGEX.test(camel)) {
    return camel
  }

  const length = camel.length

  let start = 0
  let end = 0
  let kebab = ''
  let prev = true
  let curr = isUpper(camel, 0)
  let next

  for (; end < length; end++) {
    next = isUpper(camel, end + 1)

    // detects the start of a new camel case word and avoid lowercasing abbreviations.
    if (!prev && curr && !next) {
      // @ts-expect-error - this indexing is safe.
      kebab += camel.slice(start, end) + '-' + camel[end].toLowerCase()
      start = end + 1
    }

    prev = curr
    curr = next
  }

  // Appends the remaining string.
  kebab += camel.slice(start, end)

  return kebab
}

/**
 * @type {import('.').escapeHtml}
 */
let escapeHtml = function (value) {
  if (typeof value !== 'string') {
    value = value.toString()
  }

  // This is a optimization to avoid the whole conversion process when the
  // string does not contain any uppercase characters.
  if (!ESCAPED_REGEX.test(value)) {
    return value
  }

  const length = value.length
  let escaped = ''

  let start = 0
  let end = 0

  // Faster than using regex
  // https://jsperf.app/kakihu
  for (; end < length; end++) {
    // https://wonko.com/post/html-escaping
    switch (value[end]) {
      case '&':
        escaped += value.slice(start, end) + '&amp;'
        start = end + 1
        continue
      // We don't need to escape > because it is only used to close tags.
      // https://stackoverflow.com/a/9189067
      case '<':
        escaped += value.slice(start, end) + '&lt;'
        start = end + 1
        continue
      case '"':
        escaped += value.slice(start, end) + '&#34;'
        start = end + 1
        continue
      case "'":
        escaped += value.slice(start, end) + '&#39;'
        start = end + 1
        continue
    }
  }

  // Appends the remaining string.
  escaped += value.slice(start, end)

  return escaped
}

// @ts-ignore - bun runtime have its own escapeHTML function.
// eslint-disable-next-line no-undef
if (typeof Bun !== 'undefined') escapeHtml = Bun.escapeHTML

/**
 * @type {import('.').isVoidElement}
 */
function isVoidElement (tag) {
  // Ordered by most common to least common.
  return (
    tag === 'meta' ||
    tag === 'link' ||
    tag === 'img' ||
    tag === 'br' ||
    tag === 'input' ||
    tag === 'hr' ||
    tag === 'area' ||
    tag === 'base' ||
    tag === 'col' ||
    tag === 'command' ||
    tag === 'embed' ||
    tag === 'keygen' ||
    tag === 'param' ||
    tag === 'source' ||
    tag === 'track' ||
    tag === 'wbr'
  )
}

/**
 * @type {import('.').styleToString}
 */
function styleToString (style) {
  // Faster escaping process that only looks for the " character.
  // As we use the " character to wrap the style string, we need to escape it.
  if (typeof style === 'string') {
    let end = style.indexOf('"')

    // This is a optimization to avoid having to look twice for the " character.
    // And make the loop already start in the middle
    if (end === -1) {
      return style
    }

    const length = style.length

    let escaped = ''
    let start = 0

    // Faster than using regex
    // https://jsperf.app/kakihu
    for (; end < length; end++) {
      if (style[end] === '"') {
        escaped += style.slice(start, end) + '&#34;'
        start = end + 1
      }
    }

    // Appends the remaining string.
    escaped += style.slice(start, end)

    return escaped
  }

  const keys = Object.keys(style)
  const length = keys.length

  let key
  let value
  let index = 0
  let result = ''

  for (; index < length; index++) {
    key = keys[index]
    // @ts-expect-error - this indexing is safe.
    value = style[key]

    if (value === null || value === undefined) {
      continue
    }

    // @ts-expect-error - this indexing is safe.
    result += toKebabCase(key) + ':'

    // Only needs escaping when the value is a string.
    if (typeof value !== 'string') {
      result += value.toString() + ';'
      continue
    }

    let end = value.indexOf('"')

    // This is a optimization to avoid having to look twice for the " character.
    // And make the loop already start in the middle
    if (end === -1) {
      result += value + ';'
      continue
    }

    const length = value.length
    let start = 0

    // Faster than using regex
    // https://jsperf.app/kakihu
    for (; end < length; end++) {
      if (value[end] === '"') {
        result += value.slice(start, end) + '&#34;'
        start = end + 1
      }
    }

    // Appends the remaining string.
    result += value.slice(start, end) + ';'
  }

  return result
}

/**
 * @type {import('.').attributesToString}
 */
function attributesToString (attributes) {
  if (!attributes) {
    return ''
  }

  const keys = Object.keys(attributes)
  const length = keys.length

  let key, value, type
  let result = ''
  let index = 0

  for (; index < length; index++) {
    key = keys[index]

    // Skips all @kitajs/html specific attributes.
    if (key === 'children' || key === 'safe') {
      continue
    }

    // @ts-expect-error - this indexing is safe.
    value = attributes[key]

    // React className compatibility.
    if (key === 'className') {
      // @ts-expect-error - both were provided, so use the class attribute.
      if (attributes.class !== undefined) {
        continue
      }

      key = 'class'
    }

    if (key === 'style') {
      result += ' style="' + styleToString(value) + '"'
      continue
    }

    type = typeof value

    if (type === 'boolean') {
      // Only add the attribute if the value is true.
      if (value) {
        result += ' ' + key
      }

      continue
    }

    if (value === null || value === undefined) {
      continue
    }

    result += ' ' + key

    if (type !== 'string') {
      // Non objects are
      if (type !== 'object') {
        result += '="' + value.toString() + '"'
        continue

        // Dates are always safe
      } else if (value instanceof Date) {
        result += '="' + value.toISOString() + '"'
        continue
      }

      // The object may have a overridden toString method.
      // Which results in a non escaped string.
      value = value.toString()
    }

    let end = value.indexOf('"')

    // This is a optimization to avoid having to look twice for the " character.
    // And make the loop already start in the middle
    if (end === -1) {
      result += '="' + value + '"'
      continue
    }

    result += '="'

    const length = value.length
    let start = 0

    // Faster than using regex
    // https://jsperf.app/kakihu
    for (; end < length; end++) {
      if (value[end] === '"') {
        result += value.slice(start, end) + '&#34;'
        start = end + 1
      }
    }

    // Appends the remaining string.
    result += value.slice(start, end) + '"'
  }

  return result
}

/**
 * @type {import('.').contentsToString}
 */
function contentsToString (contents, escape) {
  const length = contents.length

  if (length === 0) {
    return ''
  }

  let result = ''
  let content
  let index = 0

  for (; index < length; index++) {
    content = contents[index]

    // Ignores non 0 falsy values
    if (!content && content !== 0) {
      continue
    }

    if (Array.isArray(content)) {
      content = contentsToString(content, escape)
    }

    if (
      // @ts-expect-error - Also accepts thenable objects, not only promises
      // https://jsperf.app/zipuvi
      content.then
    ) {
      // @ts-expect-error - this is a promise
      return content.then((resolved) =>
        contentsToString(
          [
            result,
            resolved,
            contentsToString(contents.slice(index + 1), escape)
          ],
          escape
        )
      )
    }

    if (escape === true) {
      result += escapeHtml(content)
    } else {
      result += content
    }
  }

  return result
}

/**
 * Just to stop TS from complaining about the type.
 * @param {any} name
 *
 * @type {import('.').createElement}
 */
function createElement (name, attrs, ...children) {
  // Adds the children to the attributes if it is not present.
  if (attrs === null) {
    attrs = { children }
  }

  // Calls the element creator function if the name is a function
  if (typeof name === 'function') {
    // In case the children attributes is not present, add it as a property.
    if (attrs.children === undefined) {
      // When only a single child is present, unwrap it.
      if (children.length > 1) {
        attrs.children = children
      } else {
        attrs.children = children[0]
      }
    }

    return name(attrs)
  }

  if (name === Fragment) {
    return contentsToString(children)
  }

  // Switches the tag name when this custom `tag` is present.
  if (name === 'tag') {
    name = String(attrs.of)
    delete attrs.of
  }

  if (children.length === 0 && isVoidElement(name)) {
    return '<' + name + attributesToString(attrs) + '/>'
  }

  // @ts-expect-error - joins the children
  children = contentsToString(children, attrs.safe)

  // Faster than checking if `children instanceof Promise`
  // https://jsperf.app/zipuvi
  if (typeof children !== 'string') {
    // @ts-expect-error - it will be a promise here
    return children.then(
      /** @param {string} child */
      (child) =>
        '<' +
        name +
        attributesToString(attrs) +
        '>' +
        child +
        '</' +
        name +
        '>'
    )
  }

  return (
    '<' +
    name +
    attributesToString(attrs) +
    '>' +
    children +
    '</' +
    name +
    '>'
  )
}

/**
 * Just to stop TS from complaining about the type.
 * @returns {Function}
 *
 * @type {import('.').compile}
 */
function compile (htmlFn, strict = true, separator = '/*\x00*/') {
  if (typeof htmlFn !== 'function') {
    throw new Error('The first argument must be a function.')
  }

  const properties = new Set()

  const html = htmlFn(
    // @ts-expect-error - this proxy will meet the props with children requirements.
    new Proxy(
      {},
      {
        get (_, name) {
          // Adds the property to the set of known properties.
          properties.add(name)

          const isChildren = name === 'children'
          let access = `args[${separator}\`${name.toString()}\`${separator}]`

          // Adds support to render multiple children
          if (isChildren) {
            access = `Array.isArray(${access}) ? ${access}.join(${separator}\`\`${separator}) : ${access}`
          }

          // Uses ` to avoid content being escaped.
          return `\`${separator} + (${access} || ${
            strict && !isChildren
              ? `throwPropertyNotFound(${separator}\`${name.toString()}\`${separator})`
              : `${separator}\`\`${separator}`
          }) + ${separator}\``
        }
      }
    )
  )

  if (typeof html !== 'string') {
    throw new Error('You cannot use compile() with async components')
  }

  const sepLength = separator.length
  const length = html.length

  // Adds the throwPropertyNotFound function if strict
  let body = ''
  let nextStart = 0
  let index = 0

  // Escapes every ` without separator
  for (; index < length; index++) {
    // Escapes the backtick character because it will be used to wrap the string
    // in a template literal.
    if (
      html[index] === '`' &&
      html.slice(index - sepLength, index) !== separator &&
      html.slice(index + 1, index + sepLength + 1) !== separator
    ) {
      body += html.slice(nextStart, index) + '\\`'
      nextStart = index + 1
      continue
    }

    // Escapes the backslash character because it will be used to escape the
    // backtick character.
    if (html[index] === '\\') {
      body += html.slice(nextStart, index) + '\\\\'
      nextStart = index + 1
      continue
    }
  }

  // Adds the remaining string
  body += html.slice(nextStart)

  if (strict) {
    // eslint-disable-next-line no-new-func
    return Function(
      'args',
      // Checks for args presence
      'if (args === undefined) { throw new Error("The arguments object was not provided.") };\n' +
        // Function to throw when a property is not found
        'function throwPropertyNotFound(name) { throw new Error("Property " + name + " was not provided.") };\n' +
        // Concatenates the body
        `return \`${body}\``
    )
  }

  // eslint-disable-next-line no-new-func
  return Function(
    'args',
    // Adds a empty args object when it is not present
    'if (args === undefined) { args = Object.create(null) };\n' +
      `return \`${body}\``
  )
}

const Html = {
  escapeHtml,
  isVoidElement,
  attributesToString,
  toKebabCase,
  isUpper,
  styleToString,
  createElement,
  h: createElement,
  contentsToString,
  compile,
  Fragment
}

/**
 * These export configurations enable JS and TS developers
 * to consumer @kitajs/html in whatever way best suits their needs.
 * Some examples of supported import syntax includes:
 * - `const Html = require('@kitajs/html')`
 * - `const { Html } = require('@kitajs/html')`
 * - `import * as Fastify from '@kitajs/html'`
 * - `import { Html, TSC_definition } from '@kitajs/html'`
 * - `import Html from '@kitajs/html'`
 * - `import Html, { TSC_definition } from '@kitajs/html'`
 */
module.exports = Html;
module.exports.Html = Html;
module.exports.default = Html;