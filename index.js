/// <reference path="./jsx.d.ts" />

const ESCAPED_REGEX = /[<"'&]/
const CAMEL_REGEX = /[a-z][A-Z]/

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
 * Escapes a string to avoid any possible harmful html from being executed.
 *
 * @param {any} value the value to escape.
 * @returns {string} the escaped string.
 * @this {void}
 */
function escapeHtml (value) {
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

/**
 * Returns true if the element is a html void element.
 *
 * @param {string} tag the name of the element to check.
 * @returns {boolean} if the element is a html void element.
 * @this {void}
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
 * Transforms an object of style attributes into a html style string.
 *
 * @param {object | string}  style
 * @returns {string}
 * @this {void}
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
 * Transforms an object of attributes into a html attributes string.
 *
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
        // @ts-expect-error - this indexing is safe.
        result += ' ' + toKebabCase(key)
      }

      continue
    }

    if (value === null || value === undefined) {
      continue
    }

    // @ts-expect-error - this indexing is safe.
    result += ' ' + toKebabCase(key)

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
 * Joins raw string html elements into a single html string.
 *
 * A raw html fragment is just an array of strings, this method concatenates .
 *
 * @param {import('.').Children[]} contents an maybe nested array of strings to concatenate.
 * @param {boolean} [escape=false] if we should escape the contents before concatenating them.
 * @returns {string} the concatenated and escaped string of contents.
 * @this {void}
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
      result += contentsToString(content, escape)
    } else if (escape === true) {
      result += escapeHtml(content)
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

  return (
    '<' +
    name +
    attributesToString(attrs) +
    '>' +
    contentsToString(children, attrs.safe) +
    '</' +
    name +
    '>'
  )
}

/**
 * Compiles html with the given arguments specified with $name syntax.
 *
 * @param {(proxy: any) => string} htmlFn
 * @param {boolean} [strict=true] if we should throw an error when a property is not found.
 * @returns {function} the compiled template function
 * @this {void}
 */
function compile (htmlFn, strict = true, separator = '/*\x00*/') {
  if (typeof htmlFn !== 'function') {
    throw new Error('The first argument must be a function.')
  }

  const properties = new Set()

  const html = htmlFn(
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
