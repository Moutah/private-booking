import { IItem } from "../../models/Item";
import { IPost } from "../../models/Post";

declare global {
  namespace Express {
    interface Request {
      item?: IItem;
      post?: IPost;
    }
  }
}
