import faker from "faker";
import { posts } from "../documentSeeds";

export = posts.map((postSeed) => ({
  ...postSeed,

  images: [],
  message: faker.lorem.paragraph(),
}));
