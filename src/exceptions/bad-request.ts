import { ErrorCode, HttpException } from "./root";

export class BadRequestException extends HttpException {
  constructor(message: string, errorCode: ErrorCode) {
    super(400, message, errorCode, null);
  }
}
