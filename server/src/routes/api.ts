import express, { Request, Response } from "express";

// create router
export const apiRoutes = express.Router({
  strict: true,
});

// bind routes
apiRoutes.get("/ping", (req: Request, res: Response) => {
  res.json("pong");
});
