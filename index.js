/// <reference path="./jsx.d.ts" />

/**
 * A const used to represent a html fragment.
 *
 * @typedef {import('.').Fragment}
 */
const Fragment = Symbol.for('kHtmlFragment')

/**
 * Returns true if the character at the given index is an uppercase character.
 *
 * @param {string} input the string to check.
 * @param {number} index the index of the character to check.
 * @returns {boolean} if the character at the given index is an uppercase character.
 * @this {void}
 */
function isUpper (input, index) {
  const code = input.charCodeAt(index)
  return code >= 65 /* A */ && code <= 90 /* Z */
}

/**
 * Converts a camel cased string to a kebab cased string.
 *
 * @param {string} camel the camel cased string to convert.
 * @this {void}
 */
function toKebabCase (camel) {
  const length = camel.length

  let index = 0
  let kebab = ''
  let prev = true
  let curr = isUpper(camel, 0)
  let next

  for (; index < length; index++) {
    next = isUpper(camel, index + 1)

    // detects the start of a new camel case word and avoid lowercasing abbreviations.
    if (!prev && curr && !next) {
      // @ts-expect-error - this indexing is safe.
      kebab += '-' + camel[index].toLowerCase()
    } else {
      kebab += camel[index]
    }

    prev = curr
    curr = next
  }

  return kebab
}

/**
 * Escapes a string for use in an HTML attribute value.
 *
 * @param {any} value the value to escape. If the value is not a string it will be converted to a string with `toString()` or `toISOString()` if it is a Date.
 * @returns {string} the escaped string.
 * @this {void}
 */
function escapeHtml (value) {
  // Handle non string values
  if (typeof value !== 'string') {
    // HTML Dates must be ISO stringified
    value = value instanceof Date ? value.toISOString() : value.toString()
  }

  const length = value.length
  let escaped = ''
  let index = 0

  for (; index < length; index++) {
    switch (value[index]) {
      case '&':
        escaped += '&amp;'
        continue
      case '>':
        escaped += '&gt;'
        continue
      case '<':
        escaped += '&lt;'
        continue
      case '"':
        escaped += '&#34;'
        continue
      case "'":
        escaped += '&#39;'
        continue
      case '\u00A0':
        escaped += '&#32;'
        continue
      default:
        escaped += value[index]
        continue
    }
  }

  return escaped
}

/**
 * Returns true if the element is a html void element.
 *
 * @param {string} tag the name of the element to check.
 * @returns {boolean} if the element is a html void element.
 * @this {void}
 */
function isVoidElement (tag) {
  switch (tag) {
    case 'area':
    case 'base':
    case 'br':
    case 'col':
    case 'command':
    case 'embed':
    case 'hr':
    case 'img':
    case 'input':
    case 'keygen':
    case 'link':
    case 'meta':
    case 'param':
    case 'source':
    case 'track':
    case 'wbr':
    case 'tag':
      return true
    default:
      return false
  }
}

/**
 * Transforms an object of style attributes into a html style string.
 *
 * @param {object | string}  style
 * @returns {string}
 * @this {void}
 */
function styleToString (style) {
  if (typeof style === 'string') {
    return style
  }

  const keys = Object.keys(style)
  const length = keys.length

  let key
  let index = 0
  let result = ''

  for (; index < length; index++) {
    key = keys[index]

    // @ts-expect-error - this indexing is safe.
    result += toKebabCase(key) + ':' + escapeHtml(style[key]) + ';'
  }

  return result
}

/**
 * Transforms an object of attributes into a html attributes string.
 *
 * **This function does not support Date objects.**
 *
 * @example `a b="c" d="1"`
 *
 * @param {object} attributes a record of literal values to use as attributes.
 * @returns {string} the generated html attributes string.
 * @this {void}
 */
function attributesToString (attributes) {
  if (!attributes) {
    return ''
  }

  const keys = Object.keys(attributes)
  const length = keys.length

  let key, value, formattedName
  let result = ''
  let index = 0

  for (; index < length; index++) {
    key = keys[index]

    // Children is a special case and should be ignored.
    if (key === 'children') {
      continue
    }

    // @ts-expect-error - this indexing is safe.
    value = attributes[key]

    if (key === 'style') {
      result += ' style="' + styleToString(value) + '"'
      continue
    }

    // @ts-expect-error - this indexing is safe.
    formattedName = toKebabCase(key)

    if (typeof value === 'boolean') {
      // Only add the attribute if the value is true.
      if (value) {
        result += ' ' + formattedName
      }

      continue
    }

    result += ' ' + formattedName + '="' + escapeHtml(value) + '"'
  }

  return result
}

/**
 * Joins raw string html elements into a single html string.
 *
 * A raw html fragment is just an array of strings, this method concatenates .
 *
 * @param {import('.').Children[]} contents an maybe nested array of strings to concatenate.
 * @returns {string} the concatenated string of contents.
 * @this {void}
 */
function contentsToString (contents) {
  const length = contents.length

  if (length === 0) {
    return ''
  }

  let result = ''
  let content
  let index = 0

  for (; index < length; index++) {
    content = contents[index]

    // Allows null and undefined values to be ignored.
    if (content === null || content === undefined) {
      continue
    }

    if (Array.isArray(content)) {
      result += contentsToString(content)
    } else {
      result += content
    }
  }

  return result
}

/**
 * Generates a html string from the given contents.
 *
 * @param {string | Function | typeof Fragment} name the name of the element to create or a function that creates the element.
 * @param {import('.').PropsWithChildren<any> | null} attrs a record of literal values to use as attributes. A property named `children` will be used as the children of the element.
 * @param  {...import('.').Children} children the inner contents of the element.
 * @returns {string} the generated html string.
 * @this {void}
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
      if (children.length === 1) {
        attrs.children = children[0]
      } else {
        attrs.children = children
      }
    }

    return name(attrs)
  }

  if (name === Fragment) {
    return contentsToString(children)
  }

  let tag = toKebabCase(name)

  // Switches the tag name when this custom `tag` is present.
  if (name === 'tag') {
    tag = String(attrs.of)
    delete attrs.of
  }

  if (children.length === 0 && isVoidElement(name)) {
    return '<' + tag + attributesToString(attrs) + '/>'
  }

  return (
    '<' +
    tag +
    attributesToString(attrs) +
    '>' +
    contentsToString(children) +
    '</' +
    tag +
    '>'
  )
}

/**
 * Compiles html with the given arguments specified with $name syntax.
 *
 * @param {string} html
 * @returns {function} the compiled function which
 * @this {void}
 */
function compile (html) {
  const length = html.length

  let body = 'return '
  let nextStart = 0
  let paramEnd = 0
  let index = 0

  for (; index < length; index++) {
    // Escapes the backtick character because it will be used to wrap the string
    // in a template literal.
    if (html[index] === '`') {
      body += '`' + html.slice(nextStart, index) + '\\``+'
      nextStart = index + 1
      continue
    }

    // Escapes the backslash character because it will be used to escape the
    // backtick character.
    if (html[index] === '\\') {
      body += '`' + html.slice(nextStart, index) + '\\\\`+'
      nextStart = index + 1
      continue
    }

    // Skip non $ characters
    if (html[index] !== '$') {
      continue
    }

    // Finds the end index of the current variable
    paramEnd = index
    while (html[++paramEnd]?.match(/[a-zA-Z0-9]/));

    body +=
      '`' +
      html.slice(nextStart, index) +
      '`+(args["' +
      html.slice(index + 1, paramEnd) +
      '"] || "' +
      html.slice(index, paramEnd) +
      '")+'

    nextStart = paramEnd
    index = paramEnd
  }

  // Adds the remaining string
  body += '`' + html.slice(nextStart) + '`'

  // eslint-disable-next-line no-new-func
  return Function('args', body)
}

module.exports.escapeHtml = escapeHtml
module.exports.isVoidElement = isVoidElement
module.exports.attributesToString = attributesToString
module.exports.toKebabCase = toKebabCase
module.exports.isUpper = isUpper
module.exports.styleToString = styleToString
module.exports.createElement = createElement
module.exports.h = createElement
module.exports.contentsToString = contentsToString
module.exports.compile = compile
module.exports.Fragment = Fragment

// esModule interop
Object.defineProperty(exports, '__esModule', { value: true })
module.exports.default = Object.assign({}, module.exports)
