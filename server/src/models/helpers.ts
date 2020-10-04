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
