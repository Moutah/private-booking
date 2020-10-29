import { Request, Response } from "express";

/**
 * Returns a 404 response
 */
export const notFound = (req: Request, res: Response) => {
  res.status(404);
  res.type("txt").send("Not found");
};
