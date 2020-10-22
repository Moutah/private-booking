import express, { Request, Response, Express } from "express";
import passport from "passport";
import { TOKEN_LIFESPAN } from "../auth";
import { handleError } from "../middleware/error";
import User from "../models/User";
import { bookingsRouter } from "./models/bookings";
import { itemsRouter } from "./models/items";
import { postsRouter } from "./models/posts";

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

  // bind routes
  routes.use("/items", itemsRouter);
  routes.use("/items/:itemSlug/posts", postsRouter);
  routes.use("/items/:itemSlug/bookings", bookingsRouter);
  routes.get("/new-token", async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("No user for this request");
    }

    // get user
    const user = await User.findById((req.user as any).id);

    // not found
    if (!user) {
      throw new Error("User not found");
    }

    // create and returns a new JWT
    const token = user.createJWT();
    res.json({ token, expiresIn: TOKEN_LIFESPAN - 1 });
  });

  // error handling middleware
  routes.use(handleError);

  return routes;
};
