import { HttpException } from "./root";

export class InternalException extends HttpException {
  constructor(message: string, errorCode: number, errors: any) {
    super(500, message, errorCode, errors);
    this.name = "InternalException";
  }
}
