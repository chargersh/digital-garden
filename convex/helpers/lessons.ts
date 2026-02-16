import type { Doc, Id } from "../_generated/dataModel";
import type { DatabaseReader, DatabaseWriter } from "../_generated/server";

type LessonDoc = Doc<"lessons">;

export interface SidebarNode {
  id: Id<"lessons">;
  uid: string;
  title: string;
  lessonSlug: string;
  href: string;
  status: LessonDoc["status"];
  items?: SidebarNode[];
}

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

export const getLessonOrThrow = async (
  db: DatabaseReader,
  lessonId: Id<"lessons">
): Promise<LessonDoc> => {
  const lesson = await db.get(lessonId);
  if (!lesson) {
    throw new Error(`Lesson "${lessonId}" was not found.`);
  }
  return lesson;
};

export const getGroupOrThrow = async (
  db: DatabaseReader,
  groupId: Id<"lessonGroups">
): Promise<Doc<"lessonGroups">> => {
  const group = await db.get(groupId);
  if (!group) {
    throw new Error(`Lesson group "${groupId}" was not found.`);
  }
  return group;
};

export const assertNoCycle = async (
  db: DatabaseReader,
  lessonId: Id<"lessons">,
  parentLessonId: Id<"lessons"> | null
): Promise<void> => {
  const MAX_ANCESTOR_DEPTH = 100;
  let depth = 0;
  let cursor = parentLessonId;
  while (cursor) {
    depth += 1;
    if (depth > MAX_ANCESTOR_DEPTH) {
      throw new Error(
        "Cycle detection exceeded max depth; possible existing cycle in lesson ancestry."
      );
    }
    if (cursor === lessonId) {
      throw new Error("Cannot set a lesson as a child of its own subtree.");
    }
    const parent = await db.get(cursor);
    if (!parent) {
      throw new Error(`Parent lesson "${cursor}" was not found.`);
    }
    cursor = parent.parentLessonId;
  }
};

const getLessonsByVisibility = async (
  db: DatabaseReader,
  subjectId: Id<"subjects">,
  includeUnpublished: boolean
): Promise<LessonDoc[]> => {
  // includeUnpublished=true means "include non-published too", i.e. draft+archived.
  return await db
    .query("lessons")
    .withIndex("by_subjectId_and_status", (q) =>
      includeUnpublished
        ? q.eq("subjectId", subjectId)
        : q.eq("subjectId", subjectId).eq("status", "published")
    )
    .collect();
};

export const buildSidebarTree = async (
  ctx: {
    db: DatabaseReader;
  },
  subject: Doc<"subjects">,
  includeUnpublished: boolean
): Promise<{
  groups: Array<Doc<"lessonGroups"> & { items: SidebarNode[] }>;
}> => {
  const groups = await ctx.db
    .query("lessonGroups")
    .withIndex("by_subjectId_and_order", (q) => q.eq("subjectId", subject._id))
    .collect();

  const lessons = await getLessonsByVisibility(
    ctx.db,
    subject._id,
    includeUnpublished
  );

  const byId = new Map(lessons.map((lesson) => [lesson._id, lesson] as const));
  const children = new Map<Id<"lessons">, LessonDoc[]>();
  const rootsByGroup = new Map<Id<"lessonGroups">, LessonDoc[]>();

  for (const lesson of lessons) {
    if (lesson.parentLessonId) {
      const parent = byId.get(lesson.parentLessonId);
      if (!parent) {
        // Intentional: when includeUnpublished=false, non-visible parents are not in
        // byId, so their descendants are hidden from the sidebar as a subtree.
        continue;
      }
      if (parent.groupId !== lesson.groupId) {
        throw new Error(
          `Lesson "${lesson._id}" has parent in different group.`
        );
      }
      const bucket = children.get(lesson.parentLessonId) ?? [];
      bucket.push(lesson);
      children.set(lesson.parentLessonId, bucket);
      continue;
    }
    const bucket = rootsByGroup.get(lesson.groupId) ?? [];
    bucket.push(lesson);
    rootsByGroup.set(lesson.groupId, bucket);
  }

  const byOrder = (a: LessonDoc, b: LessonDoc) =>
    a.order === b.order ? a.title.localeCompare(b.title) : a.order - b.order;

  for (const bucket of children.values()) {
    bucket.sort(byOrder);
  }
  for (const bucket of rootsByGroup.values()) {
    bucket.sort(byOrder);
  }

  const buildNode = (lessonId: Id<"lessons">): SidebarNode => {
    const lesson = byId.get(lessonId);
    if (!lesson) {
      throw new Error(`Lesson "${lessonId}" not found while building tree.`);
    }
    const nested: SidebarNode[] = (children.get(lessonId) ?? []).map((child) =>
      buildNode(child._id)
    );
    return {
      id: lesson._id,
      uid: lesson.uid,
      title: lesson.title,
      lessonSlug: lesson.lessonSlug,
      href: `/${subject.slug}/${lesson.lessonSlug}`,
      status: lesson.status,
      ...(nested.length > 0 ? { items: nested } : {}),
    };
  };

  return {
    groups: groups.map((group) => ({
      ...group,
      items: (rootsByGroup.get(group._id) ?? []).map((lesson) =>
        buildNode(lesson._id)
      ),
    })),
  };
};

export const moveDescendantsToGroup = async (
  db: DatabaseReader & DatabaseWriter,
  subjectId: Id<"subjects">,
  fromGroupId: Id<"lessonGroups">,
  toGroupId: Id<"lessonGroups">,
  rootLessonId: Id<"lessons">,
  updatedAt: number
): Promise<void> => {
  const queue: Id<"lessons">[] = [rootLessonId];
  const descendantIds: Id<"lessons">[] = [];
  let queueIndex = 0;

  while (queueIndex < queue.length) {
    const currentId = queue[queueIndex];
    queueIndex += 1;

    const children = await db
      .query("lessons")
      .withIndex("by_subjectId_and_groupId_and_parentLessonId_and_order", (q) =>
        q
          .eq("subjectId", subjectId)
          .eq("groupId", fromGroupId)
          .eq("parentLessonId", currentId)
      )
      .collect();

    for (const child of children) {
      descendantIds.push(child._id);
      queue.push(child._id);
    }
  }

  for (const descendantId of descendantIds) {
    await db.patch(descendantId, {
      groupId: toGroupId,
      updatedAt,
    });
  }
};
