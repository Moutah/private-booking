import express, { Handler } from "express";
import * as authController from "../controllers/auth";
import * as pagesController from "../controllers/pages";

// create router
export const webRoutes = express.Router({
  strict: true,
});

// bind routes
webRoutes.get("/", pagesController.main);
webRoutes.get("/login", authController.login);
webRoutes.get("/logout", authController.logout);

/**
 * Build an express static handler for fils in CLIENT_BUILD_PATH.
 * @return {Handler | null}
 */
export const staticClientAssets = () => {
  return process.env.CLIENT_BUILD_PATH
    ? express.static(process.env.CLIENT_BUILD_PATH)
    : null;
};
