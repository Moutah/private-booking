import mongoose from "mongoose";
import { IImage, ImageSchema } from "./Image";

export const InfoSchema = new mongoose.Schema({
  title: { type: "String", required: [true, "Info title is required."] },
  message: { type: "String", required: [true, "Info message is required."] },
  image: ImageSchema,
});

export interface IInfo extends mongoose.Document {
  title: string;
  message: string;
  image: IImage;
}

export default mongoose.model<IInfo, mongoose.Model<IInfo>>("Info", InfoSchema);
