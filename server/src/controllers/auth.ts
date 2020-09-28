import { Request, Response } from "express";

export const login = (req: Request, res: Response) => {
  res.json("loging in...");
};
export const logout = (req: Request, res: Response) => {
  res.json("loging out...");
};
