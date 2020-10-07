// https://medium.com/@agentwhs/complete-guide-for-typescript-for-mongoose-for-node-js-8cc0a7e470c1
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const User = new mongoose.Schema({
  name: { type: String, required: [true, "User name is required."] },
  hash: { type: String, select: false },
  profileImage: String,

  email: { type: String, required: [true, "User email is required."] },
  password: { type: String, select: false },

  token: { type: String, select: false },

  items: [{ type: "ObjectId", ref: "Item" }],
});

export interface IUser extends mongoose.Document {
  name: string;
  hash: string;
  profileImage: string[];

  email: string;
  password: string;

  token: string;

  items: ObjectId[];
}

export default mongoose.model<IUser, mongoose.Model<IUser>>("User", User);
