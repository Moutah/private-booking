import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { ImageSchema, IImage } from "./Image";

const Post = new mongoose.Schema({
  images: [ImageSchema],
  message: { type: String, required: [true, "Post message is required."] },

  author: { type: "ObjectId", ref: "User", immutable: true },
  item: { type: "ObjectId", ref: "Item", immutable: true, required: true },

  createdAt: { type: Date, immutable: true, default: new Date() },
});

export interface IPost extends mongoose.Document {
  images: mongoose.Types.DocumentArray<IImage>;
  message: string;

  author: ObjectId;
  item: ObjectId;

  createdAt: Date;
}

export default mongoose.model<IPost, mongoose.Model<IPost>>("Post", Post);
