// An Error that carries an HTTP status code, so controllers can write: throw new AppError('msg', 404)
class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
module.exports = AppError;
