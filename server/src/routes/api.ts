import express, { Request, Response } from "express";
import * as itemsController from "../controllers/items";
import * as postsController from "../controllers/posts";

// create router
export const apiRoutes = express.Router({
  strict: true,
});

// bind routes
apiRoutes.get("/ping", (req: Request, res: Response) => {
  res.json("pong");
});

apiRoutes.get("/items", itemsController.index);
apiRoutes.post("/items", itemsController.insert);
apiRoutes.get("/items/:slug", itemsController.get);
apiRoutes.post("/items/:slug", itemsController.update);
apiRoutes.post("/items/:slug/delete", itemsController.remove);

apiRoutes.get("/items/:itemSlug/posts", postsController.index);
apiRoutes.post("/items/:itemSlug/posts", postsController.insert);
apiRoutes.get("/items/:itemSlug/posts/:postId", postsController.get);
apiRoutes.post("/items/:itemSlug/posts/:postId", postsController.update);
apiRoutes.post("/items/:itemSlug/posts/:postId/delete", postsController.remove);
