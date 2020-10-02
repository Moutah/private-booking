import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const Post = new mongoose.Schema({
  images: [String],
  message: String,

  author: ObjectId,
  item: ObjectId,
});

export interface IPost extends mongoose.Document {
  images: [String];
  message: String;

  author: ObjectId;
  item: ObjectId;
}

export default mongoose.model<IPost, mongoose.Model<IPost>>("Post", Post);
