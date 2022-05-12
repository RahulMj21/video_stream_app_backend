class CustomErrorHandler extends Error {
  status: number;
  message: string;

  constructor(status: number, message: string) {
    super();
    this.status = status;
    this.message = message;
  }

  static unauthorized(message = "unauthorized user", status = 401) {
    return new CustomErrorHandler(status, message);
  }
  static notFound(message = "not found", status = 404) {
    return new CustomErrorHandler(status, message);
  }
  static missingCredentials(message = "missing credentials", status = 422) {
    return new CustomErrorHandler(status, message);
  }
  static badRequest(message = "bad request", status = 400) {
    return new CustomErrorHandler(status, message);
  }
  static wentWrong(message = "Oops..something went wrong", status = 500) {
    return new CustomErrorHandler(status, message);
  }
  static conflict(message = "data conflicted", status = 409) {
    return new CustomErrorHandler(status, message);
  }
}

export default CustomErrorHandler;
