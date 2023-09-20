import { Readable } from 'stream'
import type Html from '..'

export function Suspense(props: SuspenseOptions): JSX.Element

export namespace Suspense {
  /**
   * This script needs to be loaded at the top of the page.
   */
  const Script: string

  /**
   * This function gets called every time a suspense finishes loading.
   *
   * You can then, get the request id and send it to the corresponding client.
   */
  let hydrate: (this: void, rid: number, element: string) => void
  
  /**
   * How many suspenses for a determinate `rid` are currently loading.
   */
  let pending: Record<number, number>

  /**
   * Transforms a component tree who may contain `Suspense` components into a
   * stream of HTML.
   */
  let renderToStream: (factory: (this: void, rid: number) => JSX.Element) => Readable
}

export interface SuspenseOptions {
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
  children: Html.Children
}
