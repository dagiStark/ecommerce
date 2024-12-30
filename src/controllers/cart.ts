import { CreateCartSchema, ChangeCartItemQuantitySchema } from "../schema/cart";
import { UnprocessableEntityException } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { Request, Response, NextFunction } from "express";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { User } from "@prisma/client";
import { InternalException } from "../exceptions/internal-exception";

interface CustomRequest extends Request {
  user?: User;
}

export const addItemToCart = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const validationResult = CreateCartSchema.safeParse(req.body);
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
  const product = await prismaClient.product.findUnique({
    where: {
      id: validatedData.productId,
    },
  });
  if (!product) {
    return next(new NotFoundException("Product not found!", 404, null));
  }
  const cart = await prismaClient.cartItem.create({
    data: {
      ...validatedData,
      userId: req.user!.id,
    },
  });

  if (!cart) {
    return next(new NotFoundException("Something went wrong!", 404, null));
  }
  res.status(200).json(cart);
};

export const deleteItemFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cart = await prismaClient.cartItem.delete({
    where: {
      id: +req.params.id,
    },
  });
  if (!cart) {
    next(new NotFoundException("Cart not found!", 404, null));
  }
  res.status(200).json(cart);
};

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const carts = await prismaClient.cartItem.findMany({
      where: {
        userId: req.user!.id,
      },
      include: {
        product: true,
      },
    });
    res.status(200).json(carts);
  } catch (error: any) {
    next(new InternalException("Internal Server Error!", 500, error));
  }
};

export const changeQuantity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationResult = ChangeCartItemQuantitySchema.safeParse(req.body);
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
  const cart = await prismaClient.cartItem.update({
    where: {
      id: +req.params.id,
    },
    data: {
      quantity: validatedData.quantity,
    },
  });
  if (!cart) {
    next(new NotFoundException("Cart not found!", 404, null));
  }
  res.status(200).json(cart);
};
