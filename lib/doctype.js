const Html = require('../index')

/**
 * @type {import('./doctype').Doctype}
 */
module.exports.Doctype = function (props) {
  return Html.contentsToString([
    '<!doctype ' + (props.html || 'html') + '>',
    props.children
  ])
}
