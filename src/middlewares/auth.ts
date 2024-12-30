import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import { prismaClient } from "..";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization;
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const user = await prismaClient.user.findFirst({
        where: { id: payload.userId },
      });

      if (!user) {
        console.error("User does not exist!");
        return next(
          new UnauthorizedException(
            "User does not exist!",
            ErrorCode.INVALID_TOKEN,
            null
          )
        );
      }

      (req as any).user = user;
      next();
    } catch (error) {
      next(
        new UnauthorizedException(
          "Invalid token!",
          ErrorCode.INVALID_TOKEN,
          null
        )
      );
    }
  } else {
    console.error("Authorization header missing!");
    next(
      new UnauthorizedException("Unauthorized!", ErrorCode.INVALID_TOKEN, null)
    );
  }
};

export default authMiddleware;
