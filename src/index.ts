import express, { Express, Request, Response } from "express";
import { PORT } from "./secrets";

import rootRouter from "./routes";
import { PrismaClient } from "@prisma/client";
import { errorMiddleware } from "./middlewares/errors";

const app: Express = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
app.use("/api", rootRouter);

export const prismaClient = new PrismaClient({
  log: ["query"],
}).$extends({
  result: {
    address: {
      formattedAddress: {
        needs: {
          lineOne: true,
          lineTwo: true,
          city: true,
          country: true,
          pinCode: true,
        },
        compute: ({ lineOne, lineTwo, city, country, pinCode }) => {
          return `${lineOne}, ${lineTwo}, ${city}, ${country}, ${pinCode}-$`;
        },
      },
    },
  },
});

app.use(errorMiddleware);
app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
