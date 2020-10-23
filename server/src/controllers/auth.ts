import { Request, Response, NextFunction } from "express";
import { TOKEN_LIFESPAN } from "../auth";
import User from "../models/User";

export const login = (req: Request, res: Response) => {
  res.json("loging in...");
};

export const logout = (req: Request, res: Response) => {
  res.json("loging out...");
};

export const generateNewToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // get user
  const user = await User.findById(req.user?._id);

  // not found
  if (!user) {
    next(new Error("User not found"));
    return;
  }

  // create and returns a new JWT
  const token = user.createJWT();
  res.json({ token, expiresIn: TOKEN_LIFESPAN - 1 });
};
