import express from "express";
import * as itemsController from "../../controllers/items";
import * as itemInfosController from "../../controllers/itemInfos";
import * as itemPlacesController from "../../controllers/itemPlaces";
import { loadItemBySlug } from "../../middleware/models";

// create router
export const itemsRouter = express.Router({
  mergeParams: true,
});

// *** Item

itemsRouter.get("/", [itemsController.index]);
itemsRouter.post("/", [itemsController.insert]);
itemsRouter.get("/:slug", [loadItemBySlug("slug"), itemsController.get]);
itemsRouter.post("/:slug", [loadItemBySlug("slug"), itemsController.update]);
itemsRouter.post("/:slug/delete", [
  loadItemBySlug("slug"),
  itemsController.remove,
]);

// *** Item infos

itemsRouter.post("/:slug/infos", [
  loadItemBySlug("slug"),
  itemInfosController.insert,
]);
itemsRouter.post("/:slug/infos/:infoId", [
  loadItemBySlug("slug"),
  itemInfosController.update,
]);
itemsRouter.post("/:slug/infos/:infoId/delete", [
  loadItemBySlug("slug"),
  itemInfosController.remove,
]);

// *** Item places

itemsRouter.post("/:slug/places", [
  loadItemBySlug("slug"),
  itemPlacesController.insert,
]);
itemsRouter.post("/:slug/places/:placeId", [
  loadItemBySlug("slug"),
  itemPlacesController.update,
]);
itemsRouter.post("/:slug/places/:placeId/delete", [
  loadItemBySlug("slug"),
  itemPlacesController.remove,
]);
