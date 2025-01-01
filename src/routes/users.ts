import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import { errorHandler } from "../error-handler";
import {
  addAddress,
  deleteAddress,
  listAddress,
  updateUser,
  getUserById,
  listUsers,
  changeUserRole,
} from "../controllers/users";

const usersRoutes: Router = Router();

usersRoutes.put("/", [authMiddleware], errorHandler(updateUser));
usersRoutes.post("/address", [authMiddleware], errorHandler(addAddress));
usersRoutes.delete(
  "/address/:id",
  [authMiddleware],
  errorHandler(deleteAddress)
);
usersRoutes.get("/address", [authMiddleware], errorHandler(listAddress));
usersRoutes.get("/:id", [authMiddleware], errorHandler(getUserById));
usersRoutes.get("/", [authMiddleware], errorHandler(listUsers));
usersRoutes.patch("/:id/role", [authMiddleware], errorHandler(changeUserRole));

export default usersRoutes;
