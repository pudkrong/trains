class CustomError extends Error {
  constructor (message, code) {
    super();

    Error.captureStackTrace(this, this.constructor);
    
    this.name = 'CustomError';
    this.message = message;
    if (code) {
      this.code = code;
    }
  }
}

module.exports = CustomError;