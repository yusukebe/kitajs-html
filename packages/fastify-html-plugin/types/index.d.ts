import { FastifyPluginCallback } from 'fastify';

declare module 'fastify' {
  interface FastifyReply {
    /**
     * **Synchronously** waits for the component tree to resolve and sends it at once to
     * the browser.
     *
     * This method does not support the usage of `<Suspense />`, please use
     * {@linkcode streamHtml} instead.
     *
     * If the HTML does not start with a doctype and `opts.autoDoctype` is enabled, it
     * will be added automatically.
     *
     * The correct `Content-Type` header will also be defined.
     *
     * @example
     *
     * ```tsx
     * app.get('/', (req, reply) =>
     *  reply.html(
     *    <html lang="en">
     *      <body>
     *        <h1>Hello, world!</h1>
     *      </body>
     *    </html>
     *   )
     * );
     * ```
     *
     * @param html The HTML to send.
     * @returns The response.
     */
    html(this: this, html: JSX.Element): this | Promise<this>;
  }
}

type FastifyKitaHtmlPlugin = FastifyPluginCallback<
  NonNullable<Partial<fastifyKitaHtml.FastifyKitaHtmlOptions>>
>;

declare namespace fastifyKitaHtml {
  /** Options for @kitajs/fastify-html-plugin plugin. */
  export interface FastifyKitaHtmlOptions {
    /**
     * Whether to automatically add `<!doctype html>` to a response starting with <html>,
     * if not found.
     *
     * ```tsx
     * // With autoDoctype: true you can just return the html
     * app.get('/', () => <html></html>)
     *
     * // With autoDoctype: false you must use rep.html
     * app.get('/', (req, rep) => rep.html(<html></html>)
     * ```
     *
     * @default true
     */
    autoDoctype: boolean;
  }

  export const fastifyKitaHtml: FastifyKitaHtmlPlugin;

  export { fastifyKitaHtml as default };
}

export = fastifyKitaHtml;
