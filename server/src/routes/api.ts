import express, { Request, Response } from "express";
import { itemsRouter } from "./models/items";
import { postsRouter } from "./models/posts";

// create router
export const apiRoutes = express.Router({
  strict: true,
});

// bind routes
apiRoutes.get("/ping", (req: Request, res: Response) => {
  res.json("pong");
});

apiRoutes.use("/items", itemsRouter);
apiRoutes.use("/items/:itemSlug/posts", postsRouter);
