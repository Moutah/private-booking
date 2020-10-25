import express, { Request, Response } from "express";
import passport from "passport";
import * as pagesController from "../controllers/pages";
import { handleErrorWeb } from "../middleware/error";

export const webRoutes = () => {
  // create router
  const routes = express.Router({
    strict: true,
  });

  // bind routes
  routes.get("/register", pagesController.register);
  routes.get("/login", pagesController.login);
  routes.post("/login", [
    passport.authenticate("local", { failureRedirect: "/login" }),
    (req: Request, res: Response) => res.redirect("/"),
  ]);
  routes.get("*", [
    passport.authenticate("local", { failureRedirect: "/login" }),
    pagesController.main,
  ]);

  // client static assets
  if (process.env.CLIENT_BUILD_PATH) {
    routes.use(express.static(process.env.CLIENT_BUILD_PATH));
  }

  // storage assets
  if (process.env.STORAGE_PATH) {
    routes.use("/images", express.static(process.env.STORAGE_PATH));
  }

  // error handling middleware
  routes.use(handleErrorWeb);

  return routes;
};
