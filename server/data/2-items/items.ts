import slugify from "slugify";
import faker from "faker";
import { items } from "../documentSeeds";

export = items.map((itemSeed) => {
  const itemName = faker.lorem.word();

  return {
    ...itemSeed,
    name: itemName,
    slug: slugify(itemName),

    images: [],

    description: faker.lorem.paragraph(),

    address: {
      street: faker.fake("{{address.streetName}} {{random.number}}"),
      zip: faker.address.zipCode(),
      city: faker.address.city(),
      country: faker.address.country(),
      lat: faker.address.latitude(),
      long: faker.address.longitude(),
    },

    equipment: [...Array(faker.random.number(6)).keys()].map((i) =>
      faker.random.word()
    ),
  };
});
