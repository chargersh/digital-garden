import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { DatabaseReader } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { normalizeRequired } from "./helpers/common";
import { ensureDefaultLessonGroupForSubject } from "./helpers/lessonGroups";
import {
  assertUniqueLessonSlug,
  assertUniqueLessonUid,
  getNextLessonOrder,
} from "./helpers/lessons";
import { difficultyValidator, lessonStatusValidator } from "./validators";

const lessonValidator = v.object({
  _id: v.id("lessons"),
  _creationTime: v.number(),
  uid: v.string(),
  subjectId: v.id("subjects"),
  groupId: v.id("lessonGroups"),
  parentLessonId: v.union(v.id("lessons"), v.null()),
  title: v.string(),
  description: v.string(),
  lessonSlug: v.string(),
  bodyMdx: v.string(),
  order: v.number(),
  difficulty: difficultyValidator,
  status: lessonStatusValidator,
  updatedAt: v.string(),
  summary: v.union(v.string(), v.null()),
});
const lessonMutationResultValidator = v.object({
  _id: v.id("lessons"),
  uid: v.string(),
  subjectId: v.id("subjects"),
  groupId: v.id("lessonGroups"),
  parentLessonId: v.union(v.id("lessons"), v.null()),
  title: v.string(),
  description: v.string(),
  lessonSlug: v.string(),
  bodyMdx: v.string(),
  order: v.number(),
  difficulty: difficultyValidator,
  status: lessonStatusValidator,
  updatedAt: v.string(),
  summary: v.union(v.string(), v.null()),
});

const sidebarItemValidator = v.object({
  id: v.id("lessons"),
  uid: v.string(),
  title: v.string(),
  lessonSlug: v.string(),
  href: v.string(),
  status: lessonStatusValidator,
  items: v.optional(v.array(v.any())),
});

const lessonGroupWithItemsValidator = v.object({
  _id: v.id("lessonGroups"),
  _creationTime: v.number(),
  uid: v.string(),
  subjectId: v.id("subjects"),
  title: v.string(),
  slug: v.string(),
  order: v.number(),
  isDefault: v.boolean(),
  items: v.array(sidebarItemValidator),
});

const subjectValidator = v.object({
  _id: v.id("subjects"),
  _creationTime: v.number(),
  uid: v.string(),
  name: v.string(),
  slug: v.string(),
  description: v.union(v.string(), v.null()),
  order: v.number(),
});

type LessonDoc = Doc<"lessons">;
interface SidebarNode {
  id: Id<"lessons">;
  uid: string;
  title: string;
  lessonSlug: string;
  href: string;
  status: "draft" | "published" | "archived";
  items?: SidebarNode[];
}

const getLessonOrThrow = async (
  db: DatabaseReader,
  lessonId: Id<"lessons">
): Promise<LessonDoc> => {
  const lesson = await db.get(lessonId);
  if (!lesson) {
    throw new Error(`Lesson "${lessonId}" was not found.`);
  }
  return lesson;
};

const getGroupOrThrow = async (
  db: DatabaseReader,
  groupId: Id<"lessonGroups">
) => {
  const group = await db.get(groupId);
  if (!group) {
    throw new Error(`Lesson group "${groupId}" was not found.`);
  }
  return group;
};

const assertNoCycle = async (
  db: DatabaseReader,
  lessonId: Id<"lessons">,
  parentLessonId: Id<"lessons"> | null
) => {
  let cursor = parentLessonId;
  while (cursor) {
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
  includeDrafts: boolean
): Promise<LessonDoc[]> => {
  if (!includeDrafts) {
    return await db
      .query("lessons")
      .withIndex("by_subjectId_and_status", (q) =>
        q.eq("subjectId", subjectId).eq("status", "published")
      )
      .collect();
  }

  const [draft, published, archived] = await Promise.all([
    db
      .query("lessons")
      .withIndex("by_subjectId_and_status", (q) =>
        q.eq("subjectId", subjectId).eq("status", "draft")
      )
      .collect(),
    db
      .query("lessons")
      .withIndex("by_subjectId_and_status", (q) =>
        q.eq("subjectId", subjectId).eq("status", "published")
      )
      .collect(),
    db
      .query("lessons")
      .withIndex("by_subjectId_and_status", (q) =>
        q.eq("subjectId", subjectId).eq("status", "archived")
      )
      .collect(),
  ]);

  return [...draft, ...published, ...archived];
};

export const getByRoute = query({
  args: {
    subjectSlug: v.string(),
    lessonSlug: v.string(),
    includeDrafts: v.optional(v.boolean()),
  },
  returns: v.union(
    v.object({
      subject: subjectValidator,
      lesson: lessonValidator,
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const subjectSlug = normalizeRequired(args.subjectSlug, "subjectSlug");
    const lessonSlug = normalizeRequired(args.lessonSlug, "lessonSlug");

    const subject = await ctx.db
      .query("subjects")
      .withIndex("by_slug", (q) => q.eq("slug", subjectSlug))
      .unique();
    if (!subject) {
      return null;
    }

    const lesson = await ctx.db
      .query("lessons")
      .withIndex("by_subjectId_and_lessonSlug", (q) =>
        q.eq("subjectId", subject._id).eq("lessonSlug", lessonSlug)
      )
      .unique();
    if (!lesson) {
      return null;
    }

    if (!args.includeDrafts && lesson.status !== "published") {
      return null;
    }

    return { subject, lesson };
  },
});

export const getSidebarTree = query({
  args: {
    subjectId: v.id("subjects"),
    includeDrafts: v.optional(v.boolean()),
  },
  returns: v.object({
    groups: v.array(lessonGroupWithItemsValidator),
  }),
  handler: async (ctx, args) => {
    const subject = await ctx.db.get(args.subjectId);
    if (!subject) {
      throw new Error(`Subject "${args.subjectId}" was not found.`);
    }

    const groups = await ctx.db
      .query("lessonGroups")
      .withIndex("by_subjectId_and_order", (q) =>
        q.eq("subjectId", args.subjectId)
      )
      .collect();

    const lessons = await getLessonsByVisibility(
      ctx.db,
      args.subjectId,
      args.includeDrafts ?? false
    );

    const byId = new Map(
      lessons.map((lesson) => [lesson._id, lesson] as const)
    );
    const children = new Map<Id<"lessons">, LessonDoc[]>();
    const rootsByGroup = new Map<Id<"lessonGroups">, LessonDoc[]>();

    for (const lesson of lessons) {
      if (lesson.parentLessonId) {
        const parent = byId.get(lesson.parentLessonId);
        if (!parent) {
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
      const nested: SidebarNode[] = (children.get(lessonId) ?? []).map(
        (child) => buildNode(child._id)
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
  },
});

export const create = mutation({
  args: {
    uid: v.string(),
    subjectId: v.id("subjects"),
    groupId: v.optional(v.id("lessonGroups")),
    parentLessonId: v.optional(v.union(v.id("lessons"), v.null())),
    title: v.string(),
    description: v.string(),
    lessonSlug: v.string(),
    bodyMdx: v.string(),
    difficulty: difficultyValidator,
    status: v.optional(lessonStatusValidator),
    summary: v.optional(v.union(v.string(), v.null())),
  },
  returns: lessonMutationResultValidator,
  handler: async (ctx, args) => {
    const uid = normalizeRequired(args.uid, "uid");
    const title = normalizeRequired(args.title, "title");
    const description = normalizeRequired(args.description, "description");
    const lessonSlug = normalizeRequired(args.lessonSlug, "lessonSlug");
    const bodyMdx = normalizeRequired(args.bodyMdx, "bodyMdx");
    const subject = await ctx.db.get(args.subjectId);
    if (!subject) {
      throw new Error(`Subject "${args.subjectId}" was not found.`);
    }

    const parentLessonId = args.parentLessonId ?? null;
    const parent = parentLessonId
      ? await getLessonOrThrow(ctx.db, parentLessonId)
      : null;
    if (parent && parent.subjectId !== args.subjectId) {
      throw new Error("Parent lesson must belong to the same subject.");
    }

    const defaultGroupId = await ensureDefaultLessonGroupForSubject(
      ctx.db,
      args.subjectId
    );
    const resolvedGroupId = args.groupId ?? parent?.groupId ?? defaultGroupId;
    const group = await getGroupOrThrow(ctx.db, resolvedGroupId);
    if (group.subjectId !== args.subjectId) {
      throw new Error("Lesson group must belong to the same subject.");
    }
    if (parent && parent.groupId !== resolvedGroupId) {
      throw new Error("Child and parent lessons must be in the same group.");
    }

    await Promise.all([
      assertUniqueLessonUid(ctx.db, args.subjectId, uid),
      assertUniqueLessonSlug(ctx.db, args.subjectId, lessonSlug),
    ]);

    const order = await getNextLessonOrder(
      ctx.db,
      args.subjectId,
      resolvedGroupId,
      parentLessonId
    );

    const updatedAt = new Date().toISOString();
    const summary = args.summary?.trim() ?? null;
    const lessonId = await ctx.db.insert("lessons", {
      uid,
      subjectId: args.subjectId,
      groupId: resolvedGroupId,
      parentLessonId,
      title,
      description,
      lessonSlug,
      bodyMdx,
      order,
      difficulty: args.difficulty,
      status: args.status ?? "draft",
      updatedAt,
      summary,
    });

    return {
      _id: lessonId,
      uid,
      subjectId: args.subjectId,
      groupId: resolvedGroupId,
      parentLessonId,
      title,
      description,
      lessonSlug,
      bodyMdx,
      order,
      difficulty: args.difficulty,
      status: args.status ?? "draft",
      updatedAt,
      summary,
    };
  },
});

export const update = mutation({
  args: {
    lessonId: v.id("lessons"),
    uid: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    lessonSlug: v.optional(v.string()),
    bodyMdx: v.optional(v.string()),
    difficulty: v.optional(difficultyValidator),
    summary: v.optional(v.union(v.string(), v.null())),
  },
  returns: lessonMutationResultValidator,
  handler: async (ctx, args) => {
    const lesson = await getLessonOrThrow(ctx.db, args.lessonId);
    const updatedAt = new Date().toISOString();
    const patch: Record<string, unknown> = { updatedAt };

    if (args.uid !== undefined) {
      const uid = normalizeRequired(args.uid, "uid");
      if (uid !== lesson.uid) {
        await assertUniqueLessonUid(ctx.db, lesson.subjectId, uid, lesson._id);
      }
      patch.uid = uid;
    }

    if (args.title !== undefined) {
      patch.title = normalizeRequired(args.title, "title");
    }

    if (args.description !== undefined) {
      patch.description = normalizeRequired(args.description, "description");
    }

    if (args.lessonSlug !== undefined) {
      const lessonSlug = normalizeRequired(args.lessonSlug, "lessonSlug");
      if (lessonSlug !== lesson.lessonSlug) {
        await assertUniqueLessonSlug(
          ctx.db,
          lesson.subjectId,
          lessonSlug,
          lesson._id
        );
      }
      patch.lessonSlug = lessonSlug;
    }

    if (args.bodyMdx !== undefined) {
      patch.bodyMdx = normalizeRequired(args.bodyMdx, "bodyMdx");
    }

    if (args.difficulty !== undefined) {
      patch.difficulty = args.difficulty;
    }

    if (args.summary !== undefined) {
      patch.summary = args.summary?.trim() ?? null;
    }

    await ctx.db.patch(lesson._id, patch);
    return {
      _id: lesson._id,
      uid: (patch.uid as string | undefined) ?? lesson.uid,
      subjectId: lesson.subjectId,
      groupId: lesson.groupId,
      parentLessonId: lesson.parentLessonId,
      title: (patch.title as string | undefined) ?? lesson.title,
      description:
        (patch.description as string | undefined) ?? lesson.description,
      lessonSlug: (patch.lessonSlug as string | undefined) ?? lesson.lessonSlug,
      bodyMdx: (patch.bodyMdx as string | undefined) ?? lesson.bodyMdx,
      order: (patch.order as number | undefined) ?? lesson.order,
      difficulty:
        (patch.difficulty as LessonDoc["difficulty"] | undefined) ??
        lesson.difficulty,
      status: lesson.status,
      updatedAt,
      summary: (patch.summary as string | null | undefined) ?? lesson.summary,
    };
  },
});

export const setStatus = mutation({
  args: {
    lessonId: v.id("lessons"),
    status: lessonStatusValidator,
  },
  returns: lessonMutationResultValidator,
  handler: async (ctx, args) => {
    const lesson = await getLessonOrThrow(ctx.db, args.lessonId);
    const updatedAt = new Date().toISOString();
    await ctx.db.patch(lesson._id, {
      status: args.status,
      updatedAt,
    });
    return {
      _id: lesson._id,
      uid: lesson.uid,
      subjectId: lesson.subjectId,
      groupId: lesson.groupId,
      parentLessonId: lesson.parentLessonId,
      title: lesson.title,
      description: lesson.description,
      lessonSlug: lesson.lessonSlug,
      bodyMdx: lesson.bodyMdx,
      order: lesson.order,
      difficulty: lesson.difficulty,
      status: args.status,
      updatedAt,
      summary: lesson.summary,
    };
  },
});

export const move = mutation({
  args: {
    lessonId: v.id("lessons"),
    groupId: v.optional(v.id("lessonGroups")),
    parentLessonId: v.optional(v.union(v.id("lessons"), v.null())),
  },
  returns: lessonMutationResultValidator,
  handler: async (ctx, args) => {
    const lesson = await getLessonOrThrow(ctx.db, args.lessonId);

    const targetGroupId = args.groupId ?? lesson.groupId;
    const group = await getGroupOrThrow(ctx.db, targetGroupId);
    if (group.subjectId !== lesson.subjectId) {
      throw new Error("Target group must belong to the same subject.");
    }

    const targetParent =
      args.parentLessonId === undefined
        ? lesson.parentLessonId
        : args.parentLessonId;

    if (targetParent) {
      const parent = await getLessonOrThrow(ctx.db, targetParent);
      if (parent.subjectId !== lesson.subjectId) {
        throw new Error("Parent lesson must belong to the same subject.");
      }
      if (parent.groupId !== targetGroupId) {
        throw new Error("Child and parent lessons must be in the same group.");
      }
      await assertNoCycle(ctx.db, lesson._id, targetParent);
    }

    const order = await getNextLessonOrder(
      ctx.db,
      lesson.subjectId,
      targetGroupId,
      targetParent ?? null
    );

    const updatedAt = new Date().toISOString();
    await ctx.db.patch(lesson._id, {
      groupId: targetGroupId,
      parentLessonId: targetParent ?? null,
      order,
      updatedAt,
    });
    return {
      _id: lesson._id,
      uid: lesson.uid,
      subjectId: lesson.subjectId,
      groupId: targetGroupId,
      parentLessonId: targetParent ?? null,
      title: lesson.title,
      description: lesson.description,
      lessonSlug: lesson.lessonSlug,
      bodyMdx: lesson.bodyMdx,
      order,
      difficulty: lesson.difficulty,
      status: lesson.status,
      updatedAt,
      summary: lesson.summary,
    };
  },
});

export const remove = mutation({
  args: {
    lessonId: v.id("lessons"),
  },
  returns: v.object({
    _id: v.id("lessons"),
    uid: v.string(),
  }),
  handler: async (ctx, args) => {
    const lesson = await getLessonOrThrow(ctx.db, args.lessonId);
    const child = await ctx.db
      .query("lessons")
      .withIndex("by_subjectId_and_groupId_and_parentLessonId_and_order", (q) =>
        q
          .eq("subjectId", lesson.subjectId)
          .eq("groupId", lesson.groupId)
          .eq("parentLessonId", lesson._id)
      )
      .first();
    if (child) {
      throw new Error(
        "Cannot remove lesson with sublessons. Move or delete children first."
      );
    }
    await ctx.db.delete(lesson._id);
    return {
      _id: lesson._id,
      uid: lesson.uid,
    };
  },
});

export const removeSubtree = mutation({
  args: {
    lessonId: v.id("lessons"),
  },
  returns: v.object({
    deletedLessonIds: v.array(v.id("lessons")),
    deletedLessonUids: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const subtreeRootLesson = await getLessonOrThrow(ctx.db, args.lessonId);

    const queue: Id<"lessons">[] = [subtreeRootLesson._id];
    const toDelete: Id<"lessons">[] = [];
    const deletedLessonUids: string[] = [];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId) {
        break;
      }

      toDelete.push(currentId);
      const currentLesson = await getLessonOrThrow(ctx.db, currentId);
      deletedLessonUids.push(currentLesson.uid);

      const children = await ctx.db
        .query("lessons")
        .withIndex(
          "by_subjectId_and_groupId_and_parentLessonId_and_order",
          (q) =>
            q
              .eq("subjectId", subtreeRootLesson.subjectId)
              .eq("groupId", subtreeRootLesson.groupId)
              .eq("parentLessonId", currentId)
        )
        .collect();

      for (const child of children) {
        queue.push(child._id);
      }
    }

    for (let index = toDelete.length - 1; index >= 0; index -= 1) {
      await ctx.db.delete(toDelete[index]);
    }

    return {
      deletedLessonIds: toDelete,
      deletedLessonUids,
    };
  },
});
