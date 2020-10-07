import express, { Request, Response } from "express";
import { handleError } from "../middleware/error";
import { bookingsRouter } from "./models/bookings";
import { itemsRouter } from "./models/items";
import { postsRouter } from "./models/posts";

export const apiRoutes = () => {
  // create router
  const routes = express.Router({
    strict: true,
  });

  // bind routes
  routes.get("/ping", (req: Request, res: Response) => {
    res.json("pong");
  });

  routes.use("/items", itemsRouter);
  routes.use("/items/:itemSlug/posts", postsRouter);
  routes.use("/items/:itemSlug/bookings", bookingsRouter);

  // error handling middleware
  routes.use(handleError);

  return routes;
};
