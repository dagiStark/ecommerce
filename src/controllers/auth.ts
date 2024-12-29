import { NextFunction, Request, Response } from "express";
import { prismaClient } from "..";
import { hashSync, compareSync } from "bcrypt";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { BadRequestException } from "../exceptions/bad-request";
import { ErrorCode } from "../exceptions/root";
import { LoginSchema, SignupSchema } from "../schema/users";
import { User } from "@prisma/client";

interface CustomRequest extends Request {
  user?: User;
}

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  SignupSchema.parse(req.body);
  const { email, password, name } = req.body;
  let user = await prismaClient.user.findFirst({ where: { email } });
  if (user) {
    next(
      new BadRequestException(
        "User already exists!",
        ErrorCode.USER_ALREADY_EXISTS
      )
    );
  } else {
    const newUser = await prismaClient.user.create({
      data: {
        email,
        password: hashSync(password, 10),
        name,
      },
    });
    res.status(201).json(newUser);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  LoginSchema.parse(req.body);
  const { email, password } = req.body;
  let user = await prismaClient.user.findFirst({ where: { email } });
  if (!user) {
    next(
      new BadRequestException("User does not exist!", ErrorCode.USER_NOT_FOUND)
    );
  } else {
    if (!compareSync(password, user.password)) {
      next(
        new BadRequestException(
          "Incorrect password!",
          ErrorCode.INCORRECT_PASSWORD
        )
      );
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.status(201).json({ user, token });
  }
};
export const me = (req: CustomRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return res.json(req.user);
};