/**
 * Generates the next available slug by appending a number after given
 * `baseSlug`. Looks in given `slugs` array for the highest existing slug and
 * adds 1 to that number.
 */
export const nextAvailableSlug = (
  baseSlug: string,
  slugs: string[]
): string => {
  if (slugs.length === 0) return baseSlug;

  // sort slugs in natural order
  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });

  slugs.sort(collator.compare);

  // get the last slug
  const lastSlug = slugs.pop() as string;

  // last slug has numericl part
  const lastSlugNum = lastSlug.match(/(\d+)$/);

  if (lastSlugNum) {
    return baseSlug + "-" + (parseInt(lastSlugNum[0]) + 1);
  }

  return baseSlug + "-1";
};

/**
 * Returns a random string of given `length` with characters in the set
 * [a-zA-Z0-9].
 */
export const randomString = (length: number): string => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
