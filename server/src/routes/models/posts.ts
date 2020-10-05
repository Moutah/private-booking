import express from "express";
import * as postsController from "../../controllers/posts";

// create router
export const postsRouter = express.Router({
  mergeParams: true,
});

postsRouter.get("/", postsController.index);
postsRouter.post("/", postsController.insert);
postsRouter.get("/:postId", postsController.get);
postsRouter.post("/:postId", postsController.update);
postsRouter.post("/:postId/delete", postsController.remove);
