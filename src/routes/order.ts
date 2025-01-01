import { Router } from "express";

import {
  cancelOrder,
  changeOrderStatus,
  createOrder,
  getOrderById,
  listAllOrders,
  listOrders,
  listUserOrders,
} from "../controllers/orders";
import { errorHandler } from "../error-handler";
import authMiddleware from "../middlewares/auth";

const orderRoutes: Router = Router();

orderRoutes.post("/", authMiddleware, errorHandler(createOrder));
orderRoutes.get("/:id", authMiddleware, errorHandler(getOrderById));
orderRoutes.get("/", authMiddleware, errorHandler(listOrders));
orderRoutes.put("/:id/cancel", authMiddleware, errorHandler(cancelOrder));
orderRoutes.get("/index", authMiddleware, errorHandler(listAllOrders));
orderRoutes.put("/users/:id", authMiddleware, errorHandler(listUserOrders));
orderRoutes.put("/status", authMiddleware, errorHandler(changeOrderStatus));

export default orderRoutes;
