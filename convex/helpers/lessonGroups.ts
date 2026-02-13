import type { Id } from "../_generated/dataModel";
import type { DatabaseReader, DatabaseWriter } from "../_generated/server";

export const getNextLessonGroupOrder = async (
  db: DatabaseReader,
  subjectId: Id<"subjects">
): Promise<number> => {
  const highest = await db
    .query("lessonGroups")
    .withIndex("by_subjectId_and_order", (q) => q.eq("subjectId", subjectId))
    .order("desc")
    .first();

  if (!highest) {
    return 0;
  }
  return highest.order + 1;
};

export const assertUniqueLessonGroupUid = async (
  db: DatabaseReader,
  subjectId: Id<"subjects">,
  uid: string,
  excludeId?: Id<"lessonGroups">
) => {
  const existing = await db
    .query("lessonGroups")
    .withIndex("by_subjectId_and_uid", (q) =>
      q.eq("subjectId", subjectId).eq("uid", uid)
    )
    .unique();
  if (existing && existing._id !== excludeId) {
    throw new Error(
      `Lesson group uid "${uid}" is already in use for this subject.`
    );
  }
};

export const assertUniqueLessonGroupSlug = async (
  db: DatabaseReader,
  subjectId: Id<"subjects">,
  slug: string,
  excludeId?: Id<"lessonGroups">
) => {
  const existing = await db
    .query("lessonGroups")
    .withIndex("by_subjectId_and_slug", (q) =>
      q.eq("subjectId", subjectId).eq("slug", slug)
    )
    .unique();
  if (existing && existing._id !== excludeId) {
    throw new Error(
      `Lesson group slug "${slug}" is already in use for this subject.`
    );
  }
};

export const ensureDefaultLessonGroupForSubject = async (
  db: DatabaseReader & DatabaseWriter,
  subjectId: Id<"subjects">
): Promise<Id<"lessonGroups">> => {
  const existingDefault = await db
    .query("lessonGroups")
    .withIndex("by_subjectId_and_isDefault", (q) =>
      q.eq("subjectId", subjectId).eq("isDefault", true)
    )
    .collect();

  if (existingDefault.length > 0) {
    const [first, ...duplicates] = existingDefault;
    for (const group of duplicates) {
      await db.patch(group._id, { isDefault: false });
    }
    return first._id;
  }

  const buildUniqueDefaultUid = async (): Promise<string> => {
    const baseUid = `lg_default_${subjectId}`;
    let counter = 0;

    while (true) {
      const candidate = counter === 0 ? baseUid : `${baseUid}_${counter + 1}`;
      const existing = await db
        .query("lessonGroups")
        .withIndex("by_subjectId_and_uid", (q) =>
          q.eq("subjectId", subjectId).eq("uid", candidate)
        )
        .unique();
      if (!existing) {
        return candidate;
      }
      counter += 1;
    }
  };

  const buildUniqueDefaultSlug = async (): Promise<string> => {
    const baseSlug = "lessons";
    let counter = 0;

    while (true) {
      const candidate = counter === 0 ? baseSlug : `${baseSlug}-${counter + 1}`;
      const existing = await db
        .query("lessonGroups")
        .withIndex("by_subjectId_and_slug", (q) =>
          q.eq("subjectId", subjectId).eq("slug", candidate)
        )
        .unique();
      if (!existing) {
        return candidate;
      }
      counter += 1;
    }
  };

  const [uid, slug] = await Promise.all([
    buildUniqueDefaultUid(),
    buildUniqueDefaultSlug(),
  ]);
  const order = await getNextLessonGroupOrder(db, subjectId);
  return await db.insert("lessonGroups", {
    uid,
    subjectId,
    title: "Lessons",
    slug,
    order,
    isDefault: true,
  });
};

export const setDefaultLessonGroup = async (
  db: DatabaseReader & DatabaseWriter,
  subjectId: Id<"subjects">,
  groupId: Id<"lessonGroups">
): Promise<void> => {
  const groups = await db
    .query("lessonGroups")
    .withIndex("by_subjectId_and_isDefault", (q) =>
      q.eq("subjectId", subjectId).eq("isDefault", true)
    )
    .collect();

  let shouldPatchTarget = true;
  for (const group of groups) {
    if (group._id === groupId) {
      shouldPatchTarget = false;
      continue;
    }
    await db.patch(group._id, { isDefault: false });
  }

  if (shouldPatchTarget) {
    await db.patch(groupId, { isDefault: true });
  }
};
