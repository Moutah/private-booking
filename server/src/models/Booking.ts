import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const Booking = new mongoose.Schema({
  date: Date,
  status: String,
  comment: String,

  user: { type: "ObjectId", ref: "User" },
  item: { type: "ObjectId", ref: "Item" },
});

export interface IBooking extends mongoose.Document {
  date: Date;
  status: String;
  comment: String;

  user: ObjectId;
  item: ObjectId;
}

export default mongoose.model<IBooking, mongoose.Model<IBooking>>(
  "Booking",
  Booking
);
