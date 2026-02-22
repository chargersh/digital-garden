import { type ObjectType, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { normalizeRequired } from "./helpers/common";
import {
  assertUniqueLessonGroupSlug,
  assertUniqueLessonGroupUid,
  buildUniqueLessonGroupSlug,
  ensureDefaultLessonGroupForSubject,
  getNextLessonGroupOrder,
  setDefaultLessonGroup,
} from "./helpers/lessonGroups";
import {
  lessonGroupMutationResultValidator,
  lessonGroupValidator,
} from "./validators";

const updateLessonGroupArgs = {
  groupId: v.id("lessonGroups"),
  uid: v.optional(v.string()),
  title: v.optional(v.string()),
  slug: v.optional(v.string()),
  isDefault: v.optional(v.boolean()),
};
type UpdateLessonGroupArgs = ObjectType<typeof updateLessonGroupArgs>;

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
    subjectId: v.id("subjects"),
    title: v.string(),
    isDefault: v.optional(v.boolean()),
  },
  returns: lessonGroupMutationResultValidator,
  handler: async (ctx, args) => {
    const title = normalizeRequired(args.title, "title");

    const subject = await ctx.db.get(args.subjectId);
    if (!subject) {
      throw new Error(`Subject "${args.subjectId}" was not found.`);
    }

    const uid = crypto.randomUUID();
    await assertUniqueLessonGroupUid(ctx.db, args.subjectId, uid);
    const slug = await buildUniqueLessonGroupSlug(
      ctx.db,
      args.subjectId,
      title
    );

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
  args: updateLessonGroupArgs,
  returns: lessonGroupMutationResultValidator,
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error(`Lesson group "${args.groupId}" was not found.`);
    }

    const patch: Partial<Omit<UpdateLessonGroupArgs, "groupId">> = {};

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
    const uniqueIds = new Set(args.orderedGroupIds);
    if (uniqueIds.size !== args.orderedGroupIds.length) {
      throw new Error("orderedGroupIds must not contain duplicates.");
    }

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
    const ensured = await ctx.db.get(groupId);
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

export const remove = mutation({
  args: {
    groupId: v.id("lessonGroups"),
  },
  returns: v.object({
    deletedNodeIds: v.array(v.id("lessonNodes")),
  }),
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error(`Lesson group "${args.groupId}" was not found.`);
    }

    const groupNodes = await ctx.db
      .query("lessonNodes")
      .withIndex("by_subjectId_and_groupId_and_parentNodeId_and_order", (q) =>
        q.eq("subjectId", group.subjectId).eq("groupId", group._id)
      )
      .collect();

    const deletedNodeIds = groupNodes.map((node) => node._id);

    for (const node of groupNodes) {
      if (node.kind !== "lesson") {
        continue;
      }

      const content = await ctx.db
        .query("lessonContent")
        .withIndex("by_nodeId", (q) => q.eq("nodeId", node._id))
        .unique();

      if (content) {
        await ctx.db.delete(content._id);
      }
    }

    for (const node of groupNodes) {
      await ctx.db.delete(node._id);
    }

    await ctx.db.delete(group._id);

    const remainingGroups = await ctx.db
      .query("lessonGroups")
      .withIndex("by_subjectId_and_order", (q) =>
        q.eq("subjectId", group.subjectId)
      )
      .collect();

    for (const [index, remainingGroup] of remainingGroups.entries()) {
      if (remainingGroup.order === index) {
        continue;
      }

      await ctx.db.patch(remainingGroup._id, { order: index });
    }

    if (group.isDefault) {
      const fallbackDefault = remainingGroups[0];
      if (fallbackDefault) {
        await setDefaultLessonGroup(
          ctx.db,
          group.subjectId,
          fallbackDefault._id
        );
      } else {
        await ensureDefaultLessonGroupForSubject(ctx.db, group.subjectId);
      }
    }

    return { deletedNodeIds };
  },
});
