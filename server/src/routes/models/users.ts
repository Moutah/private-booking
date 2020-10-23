import express from "express";
import * as usersController from "../../controllers/users";
import { verifyUserIsAdmin } from "../../middleware/auth";
import {
  loadMeAsTargetUser,
  loadTargetUserById,
} from "../../middleware/models";
import { handleImageUpload } from "../../middleware/store-image";

// create router
export const usersRouter = express.Router({
  mergeParams: true,
});

usersRouter.get("/me", [loadMeAsTargetUser(), usersController.me]);
usersRouter.patch("/me", [
  loadMeAsTargetUser(),
  handleImageUpload(),
  usersController.update,
]);
usersRouter.patch("/:userId", [
  verifyUserIsAdmin(),
  loadTargetUserById("userId"),
  usersController.update,
]);
usersRouter.delete("/:userId", [
  verifyUserIsAdmin(),
  loadTargetUserById("userId"),
  usersController.remove,
]);
