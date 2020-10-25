import { Request, Response, NextFunction } from "express";
import { TOKEN_LIFESPAN } from "../auth";
import User from "../models/User";
import passport from "passport";

/**
 * Generates and returns a new JWT for currently authenticated user.
 */
export const generateNewToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // get user
  const user = await User.findById(req.user?._id).exec();

  // not found
  if (!user) {
    next(new Error("User not found"));
    return;
  }

  // create and returns a new JWT
  const token = user.createJWT();
  res.json({ token, expiresIn: TOKEN_LIFESPAN - 1 });
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
