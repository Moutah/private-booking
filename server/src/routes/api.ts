import { ensureLoggedIn } from "connect-ensure-login";
import express, { Request, Response } from "express";
import passport from "passport";
import { generateNewToken } from "../controllers/auth";
import { handleErrorJson } from "../middleware/error";
import { bookingsRouter } from "./models/bookings";
import { itemsRouter } from "./models/items";
import { postsRouter } from "./models/posts";
import { meRouter, usersRouter } from "./models/users";

const jwtRoutes = () => {
  // create router
  const routesJWT = express.Router({
    strict: true,
  });

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

const loginRoutes = () => {
  // create router
  const routesLogin = express.Router({
    strict: true,
  });

  // bind routes
  routesLogin.post("/login", [
    passport.authenticate("local"),
    generateNewToken,
  ]);

  return routesLogin;
};

export const apiRoutes = () => {
  const routes = express.Router({ strict: true });
  routes.use(loginRoutes());
  routes.use(jwtRoutes());

  // error handling middleware
  routes.use(handleErrorJson);

  return routes;
};
