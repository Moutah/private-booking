import express from "express";
import * as itemsController from "../../controllers/items";

// create router
export const itemsRouter = express.Router({
  mergeParams: true,
});

itemsRouter.get("/", itemsController.index);
itemsRouter.post("/", itemsController.insert);
itemsRouter.get("/:slug", itemsController.get);
itemsRouter.post("/:slug", itemsController.update);
itemsRouter.post("/:slug/delete", itemsController.remove);
