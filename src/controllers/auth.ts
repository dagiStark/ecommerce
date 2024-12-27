import { NextFunction, Request, Response } from "express";
import { prismaClient } from "..";
import { hashSync, compareSync } from "bcrypt";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { BadRequestException } from "../exceptions/bad-request";
import { ErrorCode } from "../exceptions/root";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  let user = await prismaClient.user.findFirst({ where: { email } });
  if (!user) {
    res.status(400).send("User does not exist");
    throw new Error("User doesn't exist");
  } else {
    if (!compareSync(password, user.password)) {
      res.status(400).send("Incorrect password");
      throw new Error("Incorrect password");
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.status(201).json({ user, token });
  }
};
