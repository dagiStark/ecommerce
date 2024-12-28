import { HttpException } from "./root";

export class NotFoundException extends HttpException {
  constructor(message: string, errorCode: number, errors: any) {
    super(404, message, errorCode, errors);
    this.name = "notfoundException";
  }
}
