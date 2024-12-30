import { NextFunction, Request, Response } from "express";
import { prismaClient } from "..";
import { AddressSchema, UpdateUserSchema } from "../schema/users";
import { NotFoundException } from "../exceptions/not-found";
import { UnprocessableEntityException } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { InternalException } from "../exceptions/internal-exception";
import { User } from "@prisma/client";

interface CustomRequest extends Request {
  user?: User;
}

export const addAddress = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationResult = AddressSchema.safeParse(req.body);
    if (!validationResult.success) {
      return next(
        new UnprocessableEntityException(
          "Invalid Input!",
          null,
          ErrorCode.UNPROCESSABLE_ENTITY
        )
      );
    }
    const validatedData = validationResult.data;
    let user = req.user;

    if (!user) {
      return next(new NotFoundException("User not found!", 404, null));
    }

    const address = await prismaClient.address.create({
      data: {
        ...validatedData,
        userId: user.id,
      },
    });
    res.status(200).json(address);
  } catch (error) {
    next(new InternalException("Internal Server Error!", 500, error));
  }
};

export const deleteAddress = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const address = await prismaClient.address.delete({
    where: {
      id: +req.params.id,
    },
  });
  if (!address) {
    next(new NotFoundException("Address not found!", 404, null));
  }
  res.status(200).json(address);
};

export const listAddress = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const addresses = await prismaClient.address.findMany({
      where: {
        userId: req.user!.id,
      },
    });
    res.status(200).json(addresses);
  } catch (error: any) {
    next(new InternalException("Internal Server Error!", 500, error));
  }
};

export const updateUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const validationResult = UpdateUserSchema.safeParse(req.body);
  if (!validationResult.success) {
    return next(
      new UnprocessableEntityException(
        "Invalid Input!",
        validationResult.error.errors,
        ErrorCode.UNPROCESSABLE_ENTITY
      )
    );
  }
  const validatedData = validationResult.data;
  if (validatedData.defaultShippingAddress) {
    const shippingAddress = await prismaClient.address.findFirstOrThrow({
      where: {
        id: validatedData.defaultShippingAddress,
      },
    });

    if (!shippingAddress) {
      return next(
        new NotFoundException("Shipping Address not found!", 404, null)
      );
    }
    if (shippingAddress.userId !== req.user!.id) {
      return next(
        new UnprocessableEntityException(
          "Invalid Address!",
          null,
          ErrorCode.UNPROCESSABLE_ENTITY
        )
      );
    }
  }
  if (validatedData.defaultBillingAddress) {
    const billingAddress = await prismaClient.address.findFirstOrThrow({
      where: {
        id: validatedData.defaultBillingAddress,
      },
    });

    if (!billingAddress) {
      return next(
        new NotFoundException("Billing Address not found!", 404, null)
      );
    }
    if (billingAddress.userId !== req.user!.id) {
      return next(
        new UnprocessableEntityException(
          "Invalid Address!",
          null,
          ErrorCode.UNPROCESSABLE_ENTITY
        )
      );
    }
  }
  const user = await prismaClient.user.update({
    where: {
      id: req.user!.id,
    },
    data: {
      ...validatedData,
    },
  });
  if (!user) {
    next(new NotFoundException("User not found!", 404, null));
  }
  res.status(200).json(user);
};
