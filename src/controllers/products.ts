import { NextFunction, Request, Response } from "express";
import { prismaClient } from "..";
import { CreateProductSchema } from "../schema/products";
import { NotFoundException } from "../exceptions/not-found";
import { UnprocessableEntityException } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validatedData = CreateProductSchema.parse(req.body);
  if (!validatedData || validatedData.price < 0) {
    next(
      new UnprocessableEntityException(
        "Invalid Input!",
        null,
        ErrorCode.UNPROCESSABLE_ENTITY
      )
    );
  }
  const product = await prismaClient.product.create({
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

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validatedData = CreateProductSchema.parse(req.body);
  if (!validatedData || validatedData.price < 0) {
    next(
      new UnprocessableEntityException(
        "Invalid Input!",
        null,
        ErrorCode.UNPROCESSABLE_ENTITY
      )
    );
  }
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
    res.json(products);
  } catch (error: any) {
    res.status(400).json({
      error: "Validation failed",
      details: error.message,
    });
  }
};
