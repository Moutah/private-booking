import { Request, Response, NextFunction } from "express";
import { TOKEN_LIFESPAN } from "../auth";
import { IUser } from "../models/User";
import passport from "passport";

/**
 * Generates and returns a new JWT for currently authenticated user.
 */
export const generateNewToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as IUser;

  // create and returns a new JWT
  const refreshToken = await user.createRefreshToken();
  const token = user.createJWT();
  res.json({ token, validity: TOKEN_LIFESPAN() - 1, refreshToken });
};

/**
 * Returns passport's authenticate method using 'local' strategy. Redirects to
 * / on success and /login on failure.
 */
export const login = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
});

/**
 * Logs the user out by destroying its session and redirecting him to /login.
 */
export const logout = (req: Request, res: Response) => {
  (req.session as Express.Session).destroy((err) => res.redirect("/login"));
};
