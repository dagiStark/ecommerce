import { NextFunction, Request, Response } from "express";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { UnprocessableEntityException } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { InternalException } from "../exceptions/internal-exception";
import { User } from "@prisma/client";

type CustomRequest = Request & { user: User };

export const createOrder = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  return await prismaClient.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: {
        userId: +req.user.id,
      },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      return next(
        new UnprocessableEntityException(
          "Cart is empty!",
          null,
          ErrorCode.UNPROCESSABLE_ENTITY
        )
      );
    }

    const price = cartItems.reduce((acc, item) => {
      return acc + item.quantity * +item.product.price;
    }, 0);

    const address = await tx.address.findFirst({
      where: {
        id: req.user.defaultShippingAddress!,
      },
    });

    const order = await tx.order.create({
      data: {
        userId: +req.user.id,
        netAmount: price,
        address: address?.formattedAddress!,
        products: {
          create: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        },
      },
    });

    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        event: "ORDER_CREATED",
        status: "PENDING",
      },
    });

    await tx.cartItem.deleteMany({
      where: {
        userId: +req.user.id,
      },
    });

    return res.status(200).json(order);
  });
};

export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const order = await prismaClient.order.update({
    where: {
      id: +req.params.id,
    },
    data: { status: "CANCELLED" as const },
  });

  await prismaClient.orderEvent.create({
    data: {
      orderId: order.id,
      event: "ORDER_CANCELLED",
      status: "CANCELLED",
    },
  });
  if (!order) {
    next(new NotFoundException("Product not found!", 404, null));
  }
  res.status(200).json(order);
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const order = await prismaClient.order.findUnique({
    where: {
      id: +req.params.id,
    },
    include: {
      products: true,
      events: true,
    },
  });
  if (!order) {
    next(new NotFoundException("Product not found!", 404, null));
  }
  res.status(200).json(order);
};

export const listOrders = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prismaClient.order.findMany({
      where: {
        userId: +req.user.id,
      },
    });
    res.status(200).json(orders);
  } catch (error: any) {
    next(new InternalException("Internal Server Error!", 500, error));
  }
};

export const listAllOrders = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let whereClause = {};
    const { status } = req.query;
    if (status) {
      whereClause = {
        status: status,
      };
    }
    const orders = await prismaClient.order.findMany({
      where: whereClause,
      skip: +(req.query.skip as string) || 0,
      take: +(req.query.take as string) || 5,
    });
    res.status(200).json(orders);
  } catch (error: any) {
    next(new InternalException("Internal Server Error!", 500, error));
  }
};

export const changeOrderStatus = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const order = await prismaClient.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: {
        id: +req.params.id,
      },
      data: {
        status: req.body.status,
      },
    });

    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        event: "ORDER_STATUS_CHANGED",
        status: req.body.status,
      },
    });
    return order;
  });
  if (!order) {
    next(new NotFoundException("Order not found!", 404, null));
  }
  res.status(200).json(order);
};

export const listUserOrders = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let whereClause: any = {
      userId: +req.user.id,
    };
    const { status } = req.query;
    if (status) {
      whereClause = {
        ...whereClause,
        status: status,
      };
    }
    const orders = await prismaClient.order.findMany({
      where: whereClause,
      skip: +(req.query.skip as string) || 0,
      take: +(req.query.take as string) || 5,
    });
    res.status(200).json(orders);
  } catch (error: any) {
    next(new InternalException("Internal Server Error!", 500, error));
  }
};
