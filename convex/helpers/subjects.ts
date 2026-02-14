import type { Id } from "../_generated/dataModel";
import type { DatabaseReader } from "../_generated/server";

export const getNextSubjectOrder = async (
  db: DatabaseReader
): Promise<number> => {
  const highest = await db
    .query("subjects")
    .withIndex("by_order")
    .order("desc")
    .first();
  if (!highest) {
    return 0;
  }
  return highest.order + 1;
};

export const assertUniqueSubjectUid = async (
  db: DatabaseReader,
  uid: string,
  excludeId?: Id<"subjects">
) => {
  const existing = await db
    .query("subjects")
    .withIndex("by_uid", (q) => q.eq("uid", uid))
    .unique();
  if (existing && existing._id !== excludeId) {
    throw new Error(`Subject uid "${uid}" is already in use.`);
  }
};

export const assertUniqueSubjectSlug = async (
  db: DatabaseReader,
  slug: string,
  excludeId?: Id<"subjects">
) => {
  const existing = await db
    .query("subjects")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  if (existing && existing._id !== excludeId) {
    throw new Error(`Subject slug "${slug}" is already in use.`);
  }
};
