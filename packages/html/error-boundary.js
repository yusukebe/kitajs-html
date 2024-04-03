const { contentToString } = require('./index');
const { setTimeout } = require('node:timers/promises');

/** @type {import('./error-boundary').ErrorBoundary} */
function ErrorBoundary(props) {
  // Joins the content into a string or promise of string
  let children = contentToString(props.children);

  // Sync children, just render them
  if (typeof children === 'string') {
    return children;
  }

  // Adds race condition to children
  if (props.timeout) {
    children = Promise.race([
      children,
      setTimeout(props.timeout).then(HtmlTimeout.reject)
    ]);
  }

  // If the error boundary itself throws another error, there's nothing
  // we can do, so we just re-throw it.
  return children.catch(function errorBoundary(error) {
    if (typeof props.catch === 'function') {
      return props.catch(error);
    }

    return props.catch;
  });
}

class HtmlTimeout extends Error {
  /** @returns {string} */
  static reject() {
    throw new HtmlTimeout('Children timed out.');
  }
}

module.exports.ErrorBoundary = ErrorBoundary;
module.exports.HtmlTimeout = HtmlTimeout;
