// utils/roleMap.ts
import slugify from "slugify";
import joblists from "./joblists";

// Slugify all labels
export const jobRoleSlugs = joblists.map((label) => ({
  label,
  slug: slugify(label, { lower: true }),
}));

// Get label from slug
export function getRoleLabelFromSlug(slug: string) {
  return jobRoleSlugs.find((r) => r.slug === slug)?.label || slug;
}
