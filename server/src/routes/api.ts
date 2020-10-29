import express, { Request, Response } from "express";
import passport from "passport";
import { validateActionToken } from "../middleware/auth";
import { handleErrorJson } from "../middleware/error";
import {
  loadMeAsTargetUser,
  validateUserNotRegistred,
} from "../middleware/models";
import { bookingsRouter } from "./models/bookings";
import { itemsRouter } from "./models/items";
import { postsRouter } from "./models/posts";
import { meRouter, usersRouter } from "./models/users";
import * as usersController from "../controllers/users";
import { jwtRefreshRoutes, loginRoutes, passwordResetRoutes } from "./auth";

const jwtRoutes = () => {
  // create router
  const routesJWT = express.Router({ strict: true });

  // protect routes with JWT guard
  routesJWT.use(passport.authenticate("jwt", { session: false }));

  // ping pong
  routesJWT.get("/ping", (req: Request, res: Response) => {
    res.json("pong");
  });

  // bind routers
  routesJWT.use("/items", itemsRouter);
  routesJWT.use("/items/:itemSlug/posts", postsRouter);
  routesJWT.use("/items/:itemSlug/bookings", bookingsRouter);
  routesJWT.use("/me", meRouter);
  routesJWT.use("/users", usersRouter);

  return routesJWT;
};

const jwtActionRoutes = () => {
  // create router
  const routesJWTAction = express.Router({ strict: true });

  // protect routes with JWT refresh guard
  routesJWTAction.post("/users/register", [
    passport.authenticate("jwt-action", { session: false }),
    validateActionToken("register"),
    loadMeAsTargetUser(),
    validateUserNotRegistred(),
    usersController.update,
  ]);

  return routesJWTAction;
};

export const apiRoutes = () => {
  const routes = express.Router({ strict: true });
  routes.use(loginRoutes());
  routes.use(jwtRefreshRoutes());
  routes.use(jwtActionRoutes());
  routes.use(passwordResetRoutes());
  routes.use(jwtRoutes());

  // error handling middleware
  routes.use(handleErrorJson);

  return routes;
};
