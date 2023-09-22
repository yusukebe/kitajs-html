import type { Children } from './'
import type { Writable, Readable } from 'stream'

declare global {
  /**
   * The `SUSPENSE_ROOT` is a global object that holds the state of all the
   * suspense components rendered in the server.
   */
  var SUSPENSE_ROOT: {
    /**
     * The suspense resource map is a map of all request ids and its resources
     * containing the stream to write the HTML, the number of running promises
     * and if the first suspense has already resolved.
     */
    resources: Map<
      number,
      {
        /** if the first suspense has already resolved */
        sent: boolean
        /** how many are still running */
        running: number
        /** the stream we should write */
        stream: WeakRef<Writable>
      }
    >

    /**
     * This value is used (and incremented shortly after) when no requestId is
     * provided for {@linkcode renderToStream}
     *
     * @default 1
     */
    requestCounter: number

    /**
     * If the usage of suspense is enabled.
     *
     * @default false
     */
    enabled: boolean

    /**
     * If we should automatically stream {@linkcode SuspenseScript} before the first
     * suspense is rendered. If you disable this setting, you need to manually
     * load the {@linkcode SuspenseScript} in your HTML before any suspense is
     * rendered. Otherwise, the suspense will not work.
     *
     * @default true
     */
    autoScript: boolean
  }
}

/**
 * A component that returns a fallback while the async children are loading.
 *
 * The `rid` prop is the one {@linkcode renderToStream} returns, this way
 * the suspense knows which request it belongs to.
 */
export function Suspense(props: SuspenseProps): JSX.Element

/**
 * Transforms a component tree who may contain `Suspense` components into a
 * stream of HTML.
 *
 * @param factory The component tree to render.
 * @param rid The resource id to identify the request, if not provided, a new
 * incrementing id will be used.
 *
 * @see {@linkcode Suspense}
 */
export function renderToStream(
  factory: (this: void, rid: number) => JSX.Element,
  rid?: number
): Readable

/**
 * This script needs to be loaded at the top of the page. You do not need to
 * load it manually, unless GLOBAL_SUSPENSE.autoScript is set to false.
 *
 * @see {@linkcode Suspense}
 */
export const SuspenseScript: string

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
