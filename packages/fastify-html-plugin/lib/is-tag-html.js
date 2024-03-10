/**
 * Returns true if the string starts with `<html`, **ignores whitespace and casing**.
 *
 * @param {string} value
 * @this {void}
 */
module.exports.isTagHtml = function isTagHtml(value) {
  return (
    value
      // remove whitespace from the start of the string
      .trimStart()
      // get the first 5 characters
      .slice(0, 5)
      // compare to `<html`
      .toLowerCase() === '<html'
  );
};
