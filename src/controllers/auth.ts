import { NextFunction, Request, Response } from "express";
import { prismaClient } from "..";
import { hashSync, compareSync } from "bcrypt";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { BadRequestException } from "../exceptions/bad-request";
import { ErrorCode } from "../exceptions/root";
import { LoginSchema, SignupSchema } from "../schema/users";

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
export const me = async (req: Request, res: Response) => {
  res.json(req.user);
};
