import express from "express";
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

// static assets
export const staticClientAssets = process.env.CLIENT_PATH
  ? express.static(process.env.CLIENT_PATH)
  : null;
