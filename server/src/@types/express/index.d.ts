import { IItem } from "../../models/Item";

declare global {
  namespace Express {
    interface Request {
      item?: IItem;
    }
  }
}
