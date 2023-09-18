/// <reference path="./jsx.d.ts" />

type Html = typeof Html

/**
 * Fast and type safe HTML templates using JSX syntax.
 *
 * @module html
 * @license Apache License Version 2.0
 *
 * @link https://github.com/kitajs/html
 * @link https://www.npmjs.com/package/@kitajs/html
 * @link https://kitajs.github.io/html/
 */
declare namespace Html {
  /**
   * A const used to represent a html fragment.
   */
  export const Fragment: unique symbol

  /**
   * Returns true if the character at the given index is an uppercase character.
   *
   * @param {string} input the string to check.
   * @param {number} index the index of the character to check.
   * @returns {boolean} if the character at the given index is an uppercase character.
   * @this {void}
   */
  export function isUpper(this: void, input: string, index: number): boolean

  /**
   * Escapes a string for safe use as HTML text content. If the value is not a string,
   * it is coerced to one with its own `toString()` method.
   *
   * If the {@linkcode Bun} runtime is available, this function will be swapped out
   * to {@linkcode Bun.escapeHTML}.
   *
   * @param {unknown} value the value to escape.
   * @returns {string} the escaped string.
   * @this {void}
   */
  export function escapeHtml(this: void, value: any): string

  /**
   * Returns true if the element is a html void element.
   *
   * @param {string} tag the name of the element to check.
   * @returns {boolean} if the element is a html void element.
   * @this {void}
   */
  export function isVoidElement(this: void, tag: string): boolean

  /**
   * Transforms an object of style attributes into a html style string.
   *
   * @param {object | string} style a record of literal values to use as style attributes or a string.
   * @returns {string} the generated html style string.
   * @this {void}
   */
  export function styleToString(this: void, style: object | string): string

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
  export function attributesToString(this: void, attributes: object): string

  /**
   * Converts a camel cased string to a kebab cased string.
   *
   * @param {string} camel the camel cased string to convert.
   * @this {void}
   */
  export function toKebabCase(this: void, camel: string): string

  /**
   * Generates a html string from the given contents.
   *
   * @param {string | Function | typeof Fragment} name the name of the element to create or a function that creates the element.
   * @param {{children?: object}} [attributes] a record of literal values to use as attributes. A property named `children` will be used as the children of the element.
   * @param  {...string} contents the inner contents of the element.
   * @returns {string} the generated html string.
   * @this {void}
   */
  export function createElement<
    C extends Children[],
    N extends string | Function | typeof Fragment
  >(
    this: void,
    name: N,
    attributes: PropsWithChildren<any> | null,
    ...contents: C
  ): Promise<string> extends C[number]
    ? Promise<string>
    : N extends () => Promise<string>
    ? Promise<string>
    : string

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
  export function contentsToString<C extends Children[]>(
    this: void,
    contents: C,
    escape?: boolean
  ): Promise<string> extends C[number] ? Promise<string> : string

  /**
   * Compiles a **clean component** into a super fast component. This does not
   * support unclean components / props processing.
   *
   * A **clean component** is a component that does not process props before
   * applying them to the element. This means that the props are applied to the
   * element as is, and you need to process them before passing them to the
   * component.
   *
   * @example
   * ```tsx
   * // Clean component, render as is
   * function Clean(props: PropsWithChildren<{ repeated: string }>) {
   *   return <div>{props.repeated}</div>
   * }
   *
   * // Calculation is done before passing to the component
   * html = <Clean name={'a'.repeat(5)} />
   *
   * // Unclean component, process before render
   * function Unclean(props: { repeat: string; n: number }) {
   *   return <div>{props.repeat.repeat(props.n)}</div>
   * }
   *
   * // Calculation is done inside the component, thus cannot be used with .compile()
   * html = <Unclean repeat="a" n={5} />
   * ```
   *
   * @param {Function} htmlComponent the *clean* component to compile.
   * @param {boolean} [strict=true] if we should throw an error when a property is not found.
   * @param {string | undefined} [separator] the string used to interpolate and separate parameters
   * @returns {Function} the compiled template function
   * @this {void}
   */
  export function compile<
    P extends { [K in keyof P]: K extends 'children' ? Children : string }
  >(
    this: void,
    cleanComponent: Component<P>,
    strict?: boolean,
    separator?: string
  ): Component<P>

  /**
   * Here for interop with `preact` and many build systems.
   */
  export const h: typeof createElement

  export type Children =
    | number
    | string
    | boolean
    | null
    | undefined
    | Promise<Children>
    | Children[]

  export type PropsWithChildren<T = {}> = { children?: Children } & T

  export type Component<T = {}> = (
    this: void,
    props: PropsWithChildren<T>
  ) => JSX.Element

  /**
   * Fast and type safe HTML templates using JSX syntax.
   *
   * @module html
   * @license Apache License Version 2.0
   *
   * @link https://github.com/kitajs/html
   * @link https://www.npmjs.com/package/@kitajs/html
   * @link https://kitajs.github.io/html/
   */
  export const Html: Html
}

export = Html
