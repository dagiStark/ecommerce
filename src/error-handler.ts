import { InternalException } from "./exceptions/internal-exception";
import { ErrorCode, HttpException } from "./exceptions/root";
import { NextFunction, Request, Response } from "express";

export const errorHandler = (method: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await method(req, res, next);
    } catch (error: any) {
      let exception: HttpException;
      if (error instanceof HttpException) {
        exception = error;
      } else {
        exception = new InternalException(
          "Something went wrong!",
          ErrorCode.INTERNAL_SERVER_ERROR,
          error
        );
      }
    }
  };
};
