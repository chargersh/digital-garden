import { type ObjectType, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { normalizeRequired } from "./helpers/common";
import { getLessonNodeOrThrow } from "./helpers/lessonNodes";
import {
  difficultyValidator,
  lessonContentMutationResultValidator,
  lessonContentValidator,
} from "./validators";

const updateLessonContentArgs = {
  nodeId: v.id("lessonNodes"),
  description: v.optional(v.string()),
  bodyMdx: v.optional(v.string()),
  difficulty: v.optional(difficultyValidator),
  summary: v.optional(v.union(v.string(), v.null())),
};
type UpdateLessonContentArgs = ObjectType<typeof updateLessonContentArgs>;

export const getByNodeId = query({
  args: {
    nodeId: v.id("lessonNodes"),
  },
  returns: v.union(lessonContentValidator, v.null()),
  handler: async (ctx, args) => {
    const node = await getLessonNodeOrThrow(ctx.db, args.nodeId);
    if (node.kind !== "lesson") {
      return null;
    }

    return await ctx.db
      .query("lessonContent")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", args.nodeId))
      .unique();
  },
});

export const update = mutation({
  args: updateLessonContentArgs,
  returns: lessonContentMutationResultValidator,
  handler: async (ctx, args) => {
    const node = await getLessonNodeOrThrow(ctx.db, args.nodeId);
    if (node.kind !== "lesson") {
      throw new Error("Only lesson nodes can have lesson content.");
    }

    const content = await ctx.db
      .query("lessonContent")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", args.nodeId))
      .unique();
    if (!content) {
      throw new Error(
        `Lesson content for node "${args.nodeId}" was not found.`
      );
    }

    const updatedAt = Date.now();
    const patch: Partial<Omit<UpdateLessonContentArgs, "nodeId">> & {
      updatedAt: number;
    } = { updatedAt };

    if (args.description !== undefined) {
      patch.description = normalizeRequired(args.description, "description");
    }

    if (args.bodyMdx !== undefined) {
      patch.bodyMdx = normalizeRequired(args.bodyMdx, "bodyMdx");
    }

    if (args.difficulty !== undefined) {
      patch.difficulty = args.difficulty;
    }

    if (args.summary !== undefined) {
      const trimmed = args.summary?.trim();
      patch.summary = trimmed?.length ? trimmed : null;
    }

    await ctx.db.patch(content._id, patch);

    return {
      _id: content._id,
      nodeId: content.nodeId,
      description: patch.description ?? content.description,
      bodyMdx: patch.bodyMdx ?? content.bodyMdx,
      difficulty: patch.difficulty ?? content.difficulty,
      summary: patch.summary !== undefined ? patch.summary : content.summary,
      updatedAt,
    };
  },
});
