import mongoose from "mongoose";
import { IImage, ImageSchema } from "./Image";

export const InfoSchema = new mongoose.Schema({
  title: String,
  message: String,
  image: ImageSchema,
});

export interface IInfo extends mongoose.Document {
  title: string;
  message: string;
  image: IImage;
}

export default mongoose.model<IInfo, mongoose.Model<IInfo>>("Info", InfoSchema);
