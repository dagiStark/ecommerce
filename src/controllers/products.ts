import { NextFunction, Request, Response } from "express";
import { prismaClient } from "..";
import { CreateProductSchema } from "../schema/products";
import { NotFoundException } from "../exceptions/not-found";

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = CreateProductSchema.parse(req.body);
    const product = await prismaClient.product.create({
      data: {
        ...validatedData,
        tags: validatedData.tags.join(","),
      },
    });
    res.json(product);
  } catch (error: any) {
    res.status(400).json({
      error: "Validation failed",
      details: error.message,
    });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = CreateProductSchema.parse(req.body);
    const product = await prismaClient.product.update({
      where: {
        id: +req.params.id,
      },
      data: {
        ...validatedData,
        tags: validatedData.tags.join(","),
      },
    });
    res.json(product);
  } catch (error: any) {
    return next(
      new NotFoundException(
        "Product not found or Invalid Input!",
        404,
        error.message
      )
    );
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await prismaClient.product.delete({
      where: {
        id: +req.params.id,
      },
    });
    res.json(product);
  } catch (error: any) {
    res.status(400).json({
      error: "Validation failed",
      details: error.message,
    });
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await prismaClient.product.findUnique({
      where: {
        id: +req.params.id,
      },
    });
    res.json(product);
  } catch (error: any) {
    res.status(400).json({
      error: "Validation failed",
      details: error.message,
    });
  }
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
