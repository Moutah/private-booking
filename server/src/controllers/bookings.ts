import Booking from "../models/Booking";
import Item from "../models/Item";
import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors";

/**
 * Returns all bookings.
 */
export const index = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let item = await Item.findBySlug(req.params.itemSlug);

    const bookings = await Booking.find({ item: item._id });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

/**
 * Inserts an booking in the database with values from the given `req.body`.
 */
export const insert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let item = await Item.findBySlug(req.params.itemSlug);

    // create booking
    let booking = new Booking({
      ...req.body,
      item: item._id,
      createdAt: new Date(),
    });
    await booking.save();

    // return booking
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a specific booking from the database with id matching the one in given
 * `req.params`.
 */
export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      throw new NotFoundError();
    }

    res.status(200).json(booking);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a specific booking from the database with slug matching the one in given
 * `req.params` with the content in `req.body`.
 */
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      throw new NotFoundError();
    }

    // update booking
    booking.status = req.body.status || booking.status;
    booking.comment = req.body.comment;
    await booking.save();

    res.status(200).send();
  } catch (err) {
    next(err);
  }
};

/**
 * Remove a specific booking from the database with slug matching the one in given
 * `req.params`.
 */
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      throw new NotFoundError();
    }

    // remove booking
    await booking.remove();

    res.status(200).send();
  } catch (err) {
    next(err);
  }
};
