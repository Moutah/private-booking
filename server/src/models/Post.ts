import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const Post = new mongoose.Schema({
  images: [String],
  message: { type: String, required: [true, "Post message is required."] },

  author: { type: "ObjectId", ref: "User", immutable: true },
  item: { type: "ObjectId", ref: "Item", immutable: true, required: true },

  createdAt: { type: Date, immutable: true, default: new Date() },
});

export interface IPost extends mongoose.Document {
  images: [string];
  message: string;

  author: ObjectId;
  item: ObjectId;

  createdAt: Date;
}

export default mongoose.model<IPost, mongoose.Model<IPost>>("Post", Post);
