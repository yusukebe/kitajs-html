import type Html from '..'

/**
 * Renders a `<!doctype html>` tag.
 */
export function Doctype(props: DoctypeProps): JSX.Element

export interface DoctypeProps {
  /**
   * @default 'html'
   */
  html?: string

  /**
   * If we should concatenate this doctype with any other tag, like `<html>`   */
  children?: Html.Children
}
