import { HttpException } from "./root";

export class UnprocessableEntityException extends HttpException {
  constructor(message: string, error: any, errorCode: number) {
    super(422, message, errorCode, error);
    this.name = "UnprocessableEntityException";
  }
}
