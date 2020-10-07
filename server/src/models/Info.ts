import mongoose from "mongoose";

export const InfoSchema = new mongoose.Schema({
  title: { type: "String", required: [true, "Info title is required."] },
  message: { type: "String", required: [true, "Info message is required."] },
  image: String,
});

export interface IInfo extends mongoose.Document {
  title: string;
  message: string;
  image: string;
}

export default mongoose.model<IInfo, mongoose.Model<IInfo>>("Info", InfoSchema);
