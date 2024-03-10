/// <reference path="./types/index.d.ts" />

const fp = require('fastify-plugin');
const { isTagHtml } = require('./lib/is-tag-html');

// loads SUSPENSE_ROOT
require('@kitajs/html/suspense');

/**
 * @type {import('fastify').FastifyPluginCallback<
 *   import('./types').FastifyKitaHtmlOptions
 * >}
 */
function fastifyKitaHtml(fastify, opts, next) {
  // Good defaults
  opts.autoDoctype ??= true;

  fastify.decorateReply('html', html);

  return next();

  /** @type {import('fastify').FastifyReply['html']} */
  function html(htmlStr) {
    if (typeof htmlStr !== 'string') {
      // Recursive promise handling, rejections should just rethrow
      // just like as if it was a sync component error.
      return htmlStr.then(html.bind(this));
    }

    // prepends doctype if the html is a full html document
    if (opts.autoDoctype && isTagHtml(htmlStr)) {
      htmlStr = '<!doctype html>' + htmlStr;
    }

    this.header('content-type', 'text/html; charset=utf-8');

    // If no suspense component was used, this will not be defined.
    const requestData = SUSPENSE_ROOT.requests.get(this.request.id);

    if (!requestData) {
      return (
        this
          // Nothing needs to be sent later, content length is known
          .header('content-length', Buffer.byteLength(htmlStr))
          .send(htmlStr)
      );
    }

    requestData.stream.push(htmlStr);

    // Content-length is optional as long as the connection is closed after the response is done
    // https://www.rfc-editor.org/rfc/rfc7230#section-3.3.3

    return this.send(requestData.stream);
  }
}

module.exports = fp(fastifyKitaHtml, {
  fastify: '4.x',
  name: '@kitajs/fastify-html-plugin'
});
module.exports.default = fastifyKitaHtml;
module.exports.fastifyKitaHtml = fastifyKitaHtml;
