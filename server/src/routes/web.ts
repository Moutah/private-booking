import express from "express";
import * as authController from "../controllers/auth";
import * as pagesController from "../controllers/pages";

export const webRoutes = () => {
  // create router
  const routes = express.Router({
    strict: true,
  });

  // bind routes
  routes.get("/", pagesController.main);
  routes.get("/login", authController.login);
  routes.get("/logout", authController.logout);

  // client static assets
  if (process.env.CLIENT_BUILD_PATH) {
    routes.use(express.static(process.env.CLIENT_BUILD_PATH));
  }

  // storage assets
  if (process.env.STORAGE_PATH) {
    routes.use("/images", express.static(process.env.STORAGE_PATH));
  }

  return routes;
};
