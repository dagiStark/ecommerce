import { Router } from "express";
import authRoutes from "./auth";
import productsRoutes from "./products";
import usersRoutes from "./users";
import ordersRoutes from "./order";
import cartRoutes from "./carts";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/products", productsRoutes);
rootRouter.use("/users", usersRoutes);
rootRouter.use("/orders", ordersRoutes);
rootRouter.use("/carts", cartRoutes);

export default rootRouter;
