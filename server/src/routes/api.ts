import express, { Request, Response } from "express";
import * as itemsController from "../controllers/items";

// create router
export const apiRoutes = express.Router({
  strict: true,
});

// bind routes
apiRoutes.get("/ping", (req: Request, res: Response) => {
  res.json("pong");
});

apiRoutes.get("/items", itemsController.index);
