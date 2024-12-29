import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import { User } from "@prisma/client";

interface CustomRequest extends Request {
  user?: User;
}

const adminMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user;
  if (user?.role !== "ADMIN") {
    return next(
      new UnauthorizedException("Unauthorized!", ErrorCode.INVALID_TOKEN, null)
    );
  } else {
    next();
  }
};

export default adminMiddleware;
