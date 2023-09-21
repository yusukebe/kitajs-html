import type { Children } from './'
import type { Writable, Readable } from 'stream'

/**
 * The `SUSPENSE_ROOT` is a global object that holds the state of all the
 */
export interface SUSPENSE_ROOT {
  /** A map of `rid` keys and the number of suspenses left to resolve. */
  pending: Map<number, number>

  /** A map of `rid` and its writable  */
  handlers: Map<number, WeakRef<Writable>>

  /** The internal sid used when its not provided at {@linkcode renderToStream}  */
  rid: number
}

export const SUSPENSE_ROOT: SUSPENSE_ROOT

/**
 * A component that returns a fallback while the async children are loading.
 *
 * The `rid` prop is the one {@linkcode renderToStream} returns, this way
 * the suspense knows which request it belongs to.
 */
export function Suspense(props: SuspenseProps): JSX.Element

/**
 * This script needs to be loaded at the top of the page.
 *
 * @see {@linkcode Suspense}
 */
export const SuspenseScript: string

/**
 * Transforms a component tree who may contain `Suspense` components into a
 * stream of HTML.
 *
 * @param factory The component tree to render.
 * @param rid The request id to identify the request, if not provided, a new
 * incrementing id will be used.
 *
 * @see {@linkcode Suspense}
 */
export function renderToStream(
  factory: (this: void, rid: number) => JSX.Element,
  rid?: number
): Readable

/**
 * The props for the `Suspense` component.
 *
 * @see {@linkcode Suspense}
 */
export interface SuspenseProps {
  /**
   * The resource id is used to identify the request for this suspense.
   */
  rid: number

  /**
   * The fallback to render while the async children are loading.
   */
  fallback: JSX.Element

  /**
   * The async children to render as soon as they are ready.
   */
  children: Children
}
