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

    infos: [1, 2, 3].map((i) => ({
      title: faker.lorem.word(),
      message: faker.lorem.paragraph(),
      image: "",
    })),

    places: [1, 2, 3].map((i) => ({
      name: faker.lorem.word(),
      description: faker.lorem.paragraph(),
      type: "unknown",
    })),

    equipment: [...Array(faker.random.number(6)).keys()].map((i) =>
      faker.random.word()
    ),
  };
});
