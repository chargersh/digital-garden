import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { normalizeRequired } from "./helpers/common";
import {
  assertUniqueLessonGroupSlug,
  assertUniqueLessonGroupUid,
  ensureDefaultLessonGroupForSubject,
  getNextLessonGroupOrder,
  setDefaultLessonGroup,
} from "./helpers/lessonGroups";

const lessonGroupValidator = v.object({
  _id: v.id("lessonGroups"),
  _creationTime: v.number(),
  uid: v.string(),
  subjectId: v.id("subjects"),
  title: v.string(),
  slug: v.string(),
  order: v.number(),
  isDefault: v.boolean(),
});
const lessonGroupMutationResultValidator = v.object({
  _id: v.id("lessonGroups"),
  uid: v.string(),
  subjectId: v.id("subjects"),
  title: v.string(),
  slug: v.string(),
  order: v.number(),
  isDefault: v.boolean(),
});

export const listBySubject = query({
  args: {
    subjectId: v.id("subjects"),
  },
  returns: v.array(lessonGroupValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessonGroups")
      .withIndex("by_subjectId_and_order", (q) =>
        q.eq("subjectId", args.subjectId)
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    uid: v.string(),
    subjectId: v.id("subjects"),
    title: v.string(),
    slug: v.string(),
    isDefault: v.optional(v.boolean()),
  },
  returns: lessonGroupMutationResultValidator,
  handler: async (ctx, args) => {
    const uid = normalizeRequired(args.uid, "uid");
    const title = normalizeRequired(args.title, "title");
    const slug = normalizeRequired(args.slug, "slug");

    await assertUniqueLessonGroupUid(ctx.db, args.subjectId, uid);
    await assertUniqueLessonGroupSlug(ctx.db, args.subjectId, slug);

    const order = await getNextLessonGroupOrder(ctx.db, args.subjectId);

    const groupId = await ctx.db.insert("lessonGroups", {
      uid,
      subjectId: args.subjectId,
      title,
      slug,
      order,
      isDefault: false,
    });

    let isDefault = false;
    if (args.isDefault) {
      await setDefaultLessonGroup(ctx.db, args.subjectId, groupId);
      isDefault = true;
    }

    return {
      _id: groupId,
      uid,
      subjectId: args.subjectId,
      title,
      slug,
      order,
      isDefault,
    };
  },
});

export const update = mutation({
  args: {
    groupId: v.id("lessonGroups"),
    uid: v.optional(v.string()),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  returns: lessonGroupMutationResultValidator,
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error(`Lesson group "${args.groupId}" was not found.`);
    }

    const patch: {
      uid?: string;
      title?: string;
      slug?: string;
      isDefault?: boolean;
    } = {};

    if (args.uid !== undefined) {
      const uid = normalizeRequired(args.uid, "uid");
      await assertUniqueLessonGroupUid(ctx.db, group.subjectId, uid, group._id);
      patch.uid = uid;
    }

    if (args.title !== undefined) {
      patch.title = normalizeRequired(args.title, "title");
    }

    if (args.slug !== undefined) {
      const slug = normalizeRequired(args.slug, "slug");
      await assertUniqueLessonGroupSlug(
        ctx.db,
        group.subjectId,
        slug,
        group._id
      );
      patch.slug = slug;
    }

    let isDefault = group.isDefault;
    await ctx.db.patch(group._id, patch);

    if (args.isDefault === true) {
      await setDefaultLessonGroup(ctx.db, group.subjectId, group._id);
      isDefault = true;
    } else if (args.isDefault === false && group.isDefault) {
      throw new Error(
        "Cannot unset default directly. Set another group as default."
      );
    }

    return {
      _id: group._id,
      uid: patch.uid ?? group.uid,
      subjectId: group.subjectId,
      title: patch.title ?? group.title,
      slug: patch.slug ?? group.slug,
      order: group.order,
      isDefault,
    };
  },
});

export const reorder = mutation({
  args: {
    subjectId: v.id("subjects"),
    orderedGroupIds: v.array(v.id("lessonGroups")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const groups = await ctx.db
      .query("lessonGroups")
      .withIndex("by_subjectId_and_order", (q) =>
        q.eq("subjectId", args.subjectId)
      )
      .collect();

    const validIds = new Set(groups.map((group) => group._id));
    for (const groupId of args.orderedGroupIds) {
      if (!validIds.has(groupId)) {
        throw new Error(`Group "${groupId}" does not belong to this subject.`);
      }
    }

    let order = 0;
    const updated = new Set<Id<"lessonGroups">>();

    for (const groupId of args.orderedGroupIds) {
      await ctx.db.patch(groupId, { order });
      updated.add(groupId);
      order += 1;
    }

    for (const group of groups) {
      if (updated.has(group._id)) {
        continue;
      }
      await ctx.db.patch(group._id, { order });
      order += 1;
    }

    return null;
  },
});

export const ensureDefaultForSubject = mutation({
  args: {
    subjectId: v.id("subjects"),
  },
  returns: lessonGroupMutationResultValidator,
  handler: async (ctx, args) => {
    const groupId = await ensureDefaultLessonGroupForSubject(
      ctx.db,
      args.subjectId
    );
    const groups = await ctx.db
      .query("lessonGroups")
      .withIndex("by_subjectId_and_isDefault", (q) =>
        q.eq("subjectId", args.subjectId).eq("isDefault", true)
      )
      .collect();
    const ensured = groups.find((group) => group._id === groupId);
    if (!ensured) {
      throw new Error("Invariant violation: default lesson group missing.");
    }
    return {
      _id: ensured._id,
      uid: ensured.uid,
      subjectId: ensured.subjectId,
      title: ensured.title,
      slug: ensured.slug,
      order: ensured.order,
      isDefault: ensured.isDefault,
    };
  },
});
