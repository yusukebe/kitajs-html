/// <reference path="./jsx.d.ts" />

const capitalACharCode = 'A'.charCodeAt(0)
const capitalZCharCode = 'Z'.charCodeAt(0)

/**
 * A symbol used to represent a html fragment.
 */
const Fragment = Symbol('html.Fragment')

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
  return code >= capitalACharCode && code <= capitalZCharCode
}

/**
 * Converts a camel cased string to a kebab cased string.
 *
 * @param {string} camel the camel cased string to convert.
 * @this {void}
 */
function toKebabCase (camel) {
  const length = camel.length
  let kebab = ''
  let prevUpperCased = true
  let currentUpperCased = isUpper(camel, 0)
  let nextUpperCased = true

  for (let i = 0; i < length; i++) {
    nextUpperCased = i >= length || isUpper(camel, i + 1)

    // detects the start of a new camel case word and avoid lowercasing abbreviations.
    if (!prevUpperCased && currentUpperCased && !nextUpperCased) {
      // @ts-expect-error - this indexing is safe.
      kebab += '-' + camel[i].toLowerCase()
    } else {
      kebab += camel[i]
    }

    prevUpperCased = currentUpperCased
    currentUpperCased = nextUpperCased
  }

  return kebab
}

/**
 * Escapes a string for use in an HTML attribute value.
 *
 * @param {string} value the string to escape.
 * @returns {string} the escaped string.
 * @this {void}
 */
function escapeAttrNodeValue (value) {
  const length = value.length
  let escaped = ''

  for (let i = 0; i < length; i = i + 1) {
    switch (value[i]) {
      case '&':
        escaped += '&amp;'
        break
      case '"':
        escaped += '&quot;'
        break
      case "'":
        escaped += '&#39;'
        break
      case '\u00A0':
        escaped += '&nbsp;'
        break
      default:
        escaped += value[i]
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
      return true
    default:
      return false
  }
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

  let result = ''
  let key, value, formattedName

  for (let i = 0; i < length; i++) {
    key = keys[i]

    // Children is a special case and should be ignored.
    if (key === 'children') {
      continue
    }

    // @ts-expect-error - this indexing is safe.
    value = attributes[key]
    // @ts-expect-error - this indexing is safe.
    formattedName = toKebabCase(key)

    if (typeof value === 'boolean') {
      // Only add the attribute if the value is true.
      if (value) {
        result += ' ' + formattedName
      }

      continue
    }

    result +=
      ' ' +
      formattedName +
      '="' +
      escapeAttrNodeValue(
        // HTML Dates must be ISO stringified
        value instanceof Date ? value.toISOString() : value.toString()
      ) +
      '"'
  }

  return result
}

/**
 * Joins raw string html elements into a single html string.
 *
 * A raw html fragment is just an array of strings, this method concatenates .
 *
 * @param {(string | string[])[]} contents an maybe nested array of strings to concatenate.
 * @returns {string} the concatenated string of contents.
 * @this {void}
 */
function contentsToString (contents) {
  if (!contents) {
    return ''
  }

  let result = ''
  let content

  for (let i = 0; i < contents.length; i++) {
    content = contents[i]

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
 * @param {string | Function} name the name of the element to create or a function that creates the element.
 * @param {{children?: object}} [attributes] a record of literal values to use as attributes. A property named `children` will be used as the children of the element.
 * @param  {...string} contents the inner contents of the element.
 * @returns {string} the generated html string.
 * @this {void}
 */
function createElement (name, attributes, ...contents) {
  // Use the contents as the children if no attributes/children are provided.
  if (!attributes) {
    attributes = { children: contents }
  } else if (!attributes.children) {
    if (contents.length === 1) {
      // @ts-expect-error - this indexing is safe.
      attributes.children = contents[0]
    } else {
      attributes.children = contents
    }
  }

  // @ts-expect-error - Fragments are rendered as crateElement(createFragment, null, CHILDREN)
  if (name === Fragment) {
    return contentsToString(contents)
  }

  // Calls the element creator function if the name is a function
  if (typeof name === 'function') {
    return name(attributes, contents)
  }

  const tag = toKebabCase(name)

  if (isVoidElement(tag) && !contents.length) {
    return '<' + tag + attributesToString(attributes) + '/>'
  }

  return (
    '<' +
    tag +
    attributesToString(attributes) +
    '>' +
    contentsToString(contents) +
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

  for (let index = 0; index < length; index++) {
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

    // Skip non $ or escaped $ characters
    if (html[index] !== '$' || html[index - 1] === '\\') {
      continue
    }

    // Finds the end index of the current variable
    let paramEnd = index
    while (html[++paramEnd]?.match(/[a-zA-Z0-9]/));

    body += '`' + html.slice(nextStart, index) + '`+args["' + html.slice(index + 1, paramEnd) + '"]+'
    nextStart = paramEnd
    index = nextStart
  }

  // Adds the remaining string
  body += '`' + html.slice(nextStart) + '`'

  // eslint-disable-next-line no-new-func
  return Function('args', body)
}

module.exports.escapeAttrNodeValue = escapeAttrNodeValue
module.exports.isVoidElement = isVoidElement
module.exports.attributesToString = attributesToString
module.exports.toKebabCase = toKebabCase
module.exports.isUpper = isUpper
module.exports.createElement = createElement
module.exports.contentsToString = contentsToString
module.exports.compile = compile
module.exports.Fragment = Fragment

module.exports.__esModule = true
module.exports.default = module.exports
