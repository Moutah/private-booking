import mongoose from "mongoose";
const Schema = mongoose.Schema;

const User = new Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String },
  salt: { type: String },
  hash: { type: String },
});

export default mongoose.model("User", User);
