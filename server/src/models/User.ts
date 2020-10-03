// https://medium.com/@agentwhs/complete-guide-for-typescript-for-mongoose-for-node-js-8cc0a7e470c1
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const User = new mongoose.Schema({
  name: String,
  hash: String,
  profileImage: String,

  email: String,
  password: String,

  token: String,

  items: [{ type: "ObjectId", ref: "Item" }],
  bookings: [{ type: "ObjectId", ref: "Booking" }],
});

export interface IUser extends mongoose.Document {
  name: String;
  hash: String;
  profileImage: String;

  email: String;
  password: String;

  token: String;

  items: ObjectId[];
  bookings: ObjectId[];
}

export default mongoose.model<IUser, mongoose.Model<IUser>>("User", User);
