import { NextFunction, Request, Response } from "express";
import { prismaClient } from "..";
import { CreateProductSchema } from "../schema/products";
import { NotFoundException } from "../exceptions/not-found";
import { UnprocessableEntityException } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { InternalException } from "../exceptions/internal-exception";

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationResult = CreateProductSchema.safeParse(req.body);
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

  const product = await prismaClient.product.create({
    data: {
      ...validatedData,
      tags: validatedData.tags.join(","),
    },
  });

  if (!product) {
    return next(new NotFoundException("Product not found!", 404, null));
  }
  res.status(200).json(product);
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationResult = CreateProductSchema.safeParse(req.body);
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
  const product = await prismaClient.product.update({
    where: {
      id: +req.params.id,
    },
    data: {
      ...validatedData,
      tags: validatedData.tags.join(","),
    },
  });
  if (!product) {
    next(new NotFoundException("Product not found!", 404, null));
  }
  res.status(200).json(product);
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const product = await prismaClient.product.delete({
    where: {
      id: +req.params.id,
    },
  });
  if (!product) {
    next(new NotFoundException("Product not found!", 404, null));
  }
  res.status(200).json(product);
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const product = await prismaClient.product.findUnique({
    where: {
      id: +req.params.id,
    },
  });
  if (!product) {
    next(new NotFoundException("Product not found!", 404, null));
  }
  res.status(200).json(product);
};

export const listProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prismaClient.product.findMany();
    res.status(200).json(products);
  } catch (error: any) {
   next(new InternalException("Internal Server Error!", 500, error));
  }
};
