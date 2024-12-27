export class HttpException extends Error {
  statusCode: number;
  message: string;
  errorCode: ErrorCode;
  errors: any;

  constructor(
    statusCode: number,
    message: string,
    errorCode: ErrorCode,
    errors: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}

export enum ErrorCode {
  USER_NOT_FOUND = 1001,
  USER_ALREADY_EXISTS = 1002,
  INCORRECT_PASSWORD = 1003,
  INVALID_CREDENTIALS = 1004,
  INVALID_TOKEN = 1005,
}

