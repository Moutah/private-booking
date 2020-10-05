import express from "express";
import * as bookingsController from "../../controllers/bookings";

// create router
export const bookingsRouter = express.Router({
  mergeParams: true,
});

bookingsRouter.get("/", bookingsController.index);
bookingsRouter.post("/", bookingsController.insert);
bookingsRouter.get("/:bookingId", bookingsController.get);
bookingsRouter.post("/:bookingId", bookingsController.update);
bookingsRouter.post("/:bookingId/delete", bookingsController.remove);
