import express from "express";
import passport from "passport";
import { generateNewToken } from "../controllers/auth";
import { validateRefreshToken, validateActionToken } from "../middleware/auth";
import * as authController from "../controllers/auth";
import { loadMeAsTargetUser } from "../middleware/models";
import * as usersController from "../controllers/users";

export const jwtRefreshRoutes = () => {
  // create router
  const routesJWTRefresh = express.Router({ strict: true });

  // protect routes with JWT refresh guard
  routesJWTRefresh.post("/refresh-token", [
    passport.authenticate("jwt-refresh", { session: false }),
    validateRefreshToken(),
    generateNewToken,
  ]);

  return routesJWTRefresh;
};

export const loginRoutes = () => {
  // create router
  const routesLogin = express.Router({ strict: true });

  // bind routes
  routesLogin.post("/login", [
    passport.authenticate("local"),
    generateNewToken,
  ]);

  return routesLogin;
};

export const passwordResetRoutes = () => {
  // create router
  const routesPasswordReset = express.Router({ strict: true });

  // bind routes
  routesPasswordReset.post(
    "/request-password-reset",
    authController.requestPasswordReset
  );
  routesPasswordReset.post("/reset-password", [
    passport.authenticate("jwt-action", { session: false }),
    validateActionToken("password-reset"),
    loadMeAsTargetUser(),
    usersController.update,
  ]);

  return routesPasswordReset;
};
