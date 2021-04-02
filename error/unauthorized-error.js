class UnauthorizedError extends Error {
  /**
   * @param {String} message
   */
  constructor(message) {
    super();
    this.message = message;
    this.code = 401;
  }
}

module.exports = UnauthorizedError;
