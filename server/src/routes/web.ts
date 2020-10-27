import express, { Request, Response } from "express";
import * as authController from "../controllers/auth";
import * as pagesController from "../controllers/pages";
import { handleErrorWeb } from "../middleware/error";
import { ensureLoggedIn } from "connect-ensure-login";

export const webRoutes = () => {
  // create router
  const routes = express.Router({
    strict: true,
  });

  // bind routes
  routes.get("/register", pagesController.register);
  routes.get("/login", pagesController.login);
  routes.post("/login", authController.login);
  routes.get("/logout", authController.logout);
  routes.get("/", [ensureLoggedIn("/login"), pagesController.main]);

  // fallback route
  // routes.get("*", (req: Request, res: Response) => {
  //   // request still unhandled
  //   if (!res.writableEnded) {
  //     res.redirect("/");
  //   }
  // });

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
