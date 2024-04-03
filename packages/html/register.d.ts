declare global {
  /**
   * The html factory namespace.
   *
   * @deprecated The `@kitajs/html/register` import has been DEPRECATED and will be
   *   removed in the next major version. See
   *   https://github.com/kitajs/html/tree/master/packages/html#deprecating-global-register
   */
  var Html: typeof import('./index');
}

export {};
