import express from "express";
import * as itemsController from "../../controllers/items";
import { loadItemBySlug } from "../../middleware/models";

// create router
export const itemsRouter = express.Router({
  mergeParams: true,
});

itemsRouter.get("/", [itemsController.index]);
itemsRouter.post("/", [itemsController.insert]);
itemsRouter.get("/:slug", [loadItemBySlug("slug"), itemsController.get]);
itemsRouter.post("/:slug", [loadItemBySlug("slug"), itemsController.update]);
itemsRouter.post("/:slug/delete", [
  loadItemBySlug("slug"),
  itemsController.remove,
]);
