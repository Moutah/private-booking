import { IItem } from "../../src/models/Item";

declare global {
  namespace Express {
    export interface Request {
      item?: IItem;
    }
  }
}
