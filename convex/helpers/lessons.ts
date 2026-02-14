import type { Id } from "../_generated/dataModel";
import type { DatabaseReader } from "../_generated/server";

export const assertUniqueLessonUid = async (
  db: DatabaseReader,
  subjectId: Id<"subjects">,
  uid: string,
  excludeId?: Id<"lessons">
) => {
  const existing = await db
    .query("lessons")
    .withIndex("by_subjectId_and_uid", (q) =>
      q.eq("subjectId", subjectId).eq("uid", uid)
    )
    .unique();
  if (existing && existing._id !== excludeId) {
    throw new Error(`Lesson uid "${uid}" is already in use for this subject.`);
  }
};

export const assertUniqueLessonSlug = async (
  db: DatabaseReader,
  subjectId: Id<"subjects">,
  lessonSlug: string,
  excludeId?: Id<"lessons">
) => {
  const existing = await db
    .query("lessons")
    .withIndex("by_subjectId_and_lessonSlug", (q) =>
      q.eq("subjectId", subjectId).eq("lessonSlug", lessonSlug)
    )
    .unique();
  if (existing && existing._id !== excludeId) {
    throw new Error(
      `Lesson slug "${lessonSlug}" is already in use for this subject.`
    );
  }
};

export const getNextLessonOrder = async (
  db: DatabaseReader,
  subjectId: Id<"subjects">,
  groupId: Id<"lessonGroups">,
  parentLessonId: Id<"lessons"> | null
): Promise<number> => {
  const highest = await db
    .query("lessons")
    .withIndex("by_subjectId_and_groupId_and_parentLessonId_and_order", (q) =>
      q
        .eq("subjectId", subjectId)
        .eq("groupId", groupId)
        .eq("parentLessonId", parentLessonId)
    )
    .order("desc")
    .first();

  if (!highest) {
    return 0;
  }
  return highest.order + 1;
};
