import express, { Request, Response } from "express";
import passport from "passport";
import { generateNewToken } from "../controllers/auth";
import { handleError } from "../middleware/error";
import { bookingsRouter } from "./models/bookings";
import { itemsRouter } from "./models/items";
import { postsRouter } from "./models/posts";
import { usersRouter } from "./models/users";

export const apiRoutes = () => {
  // create router
  const routes = express.Router({
    strict: true,
  });

  // protect all routes with JWT guard
  routes.use(passport.authenticate("jwt", { session: false }));

  // ping pong
  routes.get("/ping", (req: Request, res: Response) => {
    res.json("pong");
  });

  // bind routers
  routes.use("/items", itemsRouter);
  routes.use("/items/:itemSlug/posts", postsRouter);
  routes.use("/items/:itemSlug/bookings", bookingsRouter);
  routes.use("/", usersRouter);

  // bind routes
  routes.get("/new-token", generateNewToken);

  // error handling middleware
  routes.use(handleError);

  return routes;
};
