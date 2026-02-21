import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { normalizeRequired } from "./helpers/common";
import {
  assertNoNodeCycle,
  assertParentNodeForChild,
  assertUniqueLessonNodeUid,
  buildDefaultLessonBody,
  buildDefaultLessonDescription,
  buildSidebarTree,
  buildUniqueSiblingSlug,
  deleteSubtree,
  getLessonGroupOrThrow,
  getLessonNodeOrThrow,
  getNextLessonNodeOrder,
  reassignSubtreeGroup,
  reindexSiblingOrders,
  resolveNodeStatus,
  toNodeResult,
} from "./helpers/lessonNodes";
import {
  difficultyValidator,
  lessonContentMutationResultValidator,
  lessonContentValidator,
  lessonGroupWithNodeItemsValidator,
  lessonNodeKindValidator,
  lessonNodeMutationResultValidator,
  lessonNodeStatusValidator,
  lessonNodeValidator,
  subjectValidator,
} from "./validators";

const createGroupChildResultValidator = v.object({
  node: lessonNodeMutationResultValidator,
  content: v.union(lessonContentMutationResultValidator, v.null()),
});

const removeNodeResultValidator = v.object({
  deletedNodeIds: v.array(v.id("lessonNodes")),
});

export const getSidebarTreeBySubject = query({
  args: {
    subjectId: v.id("subjects"),
    includeUnpublished: v.optional(v.boolean()),
    includeEmptyCollapsibles: v.optional(v.boolean()),
  },
  returns: v.object({
    groups: v.array(lessonGroupWithNodeItemsValidator),
  }),
  handler: async (ctx, args) => {
    const includeUnpublished = args.includeUnpublished ?? false;
    const includeEmptyCollapsibles =
      args.includeEmptyCollapsibles ?? includeUnpublished;

    return await buildSidebarTree(
      ctx.db,
      args.subjectId,
      includeUnpublished,
      includeEmptyCollapsibles
    );
  },
});

export const getLessonByPath = query({
  args: {
    subjectSlug: v.string(),
    pathParts: v.array(v.string()),
    includeUnpublished: v.optional(v.boolean()),
  },
  returns: v.union(
    v.object({
      subject: subjectValidator,
      node: lessonNodeValidator,
      content: lessonContentValidator,
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const subjectSlug = normalizeRequired(args.subjectSlug, "subjectSlug");
    if (args.pathParts.length === 0) {
      return null;
    }

    const subject = await ctx.db
      .query("subjects")
      .withIndex("by_slug", (q) => q.eq("slug", subjectSlug))
      .unique();
    if (!subject) {
      return null;
    }

    let parentNodeId: Doc<"lessonNodes">["_id"] | null = null;
    let currentNode: Doc<"lessonNodes"> | null = null;

    for (const rawPathPart of args.pathParts) {
      const pathPart = normalizeRequired(rawPathPart, "pathPart");
      const matched = await ctx.db
        .query("lessonNodes")
        .withIndex("by_subjectId_and_parentNodeId_and_slug", (q) =>
          q
            .eq("subjectId", subject._id)
            .eq("parentNodeId", parentNodeId)
            .eq("slug", pathPart)
        )
        .unique();

      if (!matched) {
        return null;
      }

      currentNode = matched;
      parentNodeId = matched._id;
    }

    if (!currentNode || currentNode.kind !== "lesson") {
      return null;
    }

    if (!args.includeUnpublished && currentNode.status !== "published") {
      return null;
    }

    const content = await ctx.db
      .query("lessonContent")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", currentNode._id))
      .unique();

    if (!content) {
      throw new Error(
        `Invariant violation: lesson content for node "${currentNode._id}" is missing.`
      );
    }

    return {
      subject,
      node: currentNode,
      content,
    };
  },
});

export const getNodeById = query({
  args: {
    nodeId: v.id("lessonNodes"),
  },
  returns: v.union(lessonNodeValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.nodeId);
  },
});

export const createGroupChild = mutation({
  args: {
    uid: v.string(),
    subjectId: v.id("subjects"),
    groupId: v.id("lessonGroups"),
    parentNodeId: v.optional(v.union(v.id("lessonNodes"), v.null())),
    kind: lessonNodeKindValidator,
    title: v.string(),
    slug: v.optional(v.string()),
    status: v.optional(lessonNodeStatusValidator),
    description: v.optional(v.string()),
    bodyMdx: v.optional(v.string()),
    difficulty: v.optional(difficultyValidator),
    summary: v.optional(v.union(v.string(), v.null())),
  },
  returns: createGroupChildResultValidator,
  handler: async (ctx, args) => {
    const uid = normalizeRequired(args.uid, "uid");
    const title = normalizeRequired(args.title, "title");
    const parentNodeId = args.parentNodeId ?? null;

    const subject = await ctx.db.get(args.subjectId);
    if (!subject) {
      throw new Error(`Subject "${args.subjectId}" was not found.`);
    }

    const group = await getLessonGroupOrThrow(ctx.db, args.groupId);
    if (group.subjectId !== args.subjectId) {
      throw new Error("Lesson group must belong to the same subject.");
    }

    await assertParentNodeForChild(
      ctx.db,
      args.subjectId,
      args.groupId,
      parentNodeId
    );
    await assertUniqueLessonNodeUid(ctx.db, args.subjectId, uid);

    const slugSource =
      args.slug !== undefined ? normalizeRequired(args.slug, "slug") : title;
    const slug = await buildUniqueSiblingSlug(
      ctx.db,
      args.subjectId,
      parentNodeId,
      slugSource
    );

    const status = resolveNodeStatus(args.kind, args.status);
    const order = await getNextLessonNodeOrder(
      ctx.db,
      args.subjectId,
      args.groupId,
      parentNodeId
    );
    const updatedAt = Date.now();

    const nodeId = await ctx.db.insert("lessonNodes", {
      uid,
      subjectId: args.subjectId,
      groupId: args.groupId,
      parentNodeId,
      kind: args.kind,
      title,
      slug,
      order,
      status,
      updatedAt,
    });

    await reindexSiblingOrders(
      ctx.db,
      args.subjectId,
      args.groupId,
      parentNodeId
    );
    const persistedNode = await getLessonNodeOrThrow(ctx.db, nodeId);

    if (args.kind === "collapsible") {
      return {
        node: toNodeResult(persistedNode),
        content: null,
      };
    }

    const description =
      args.description !== undefined
        ? normalizeRequired(args.description, "description")
        : buildDefaultLessonDescription(title);
    const bodyMdx =
      args.bodyMdx !== undefined
        ? normalizeRequired(args.bodyMdx, "bodyMdx")
        : buildDefaultLessonBody(title);
    const trimmedSummary = args.summary?.trim();
    const summary = trimmedSummary?.length ? trimmedSummary : null;

    const existingContent = await ctx.db
      .query("lessonContent")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", nodeId))
      .unique();
    if (existingContent) {
      throw new Error(
        `Invariant violation: lesson content for node "${nodeId}" already exists.`
      );
    }

    const difficulty = args.difficulty ?? "beginner";
    const contentId = await ctx.db.insert("lessonContent", {
      nodeId,
      description,
      bodyMdx,
      difficulty,
      summary,
      updatedAt,
    });

    return {
      node: toNodeResult(persistedNode),
      content: {
        _id: contentId,
        nodeId,
        description,
        bodyMdx,
        difficulty,
        summary,
        updatedAt,
      },
    };
  },
});

export const updateNode = mutation({
  args: {
    nodeId: v.id("lessonNodes"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    status: v.optional(lessonNodeStatusValidator),
  },
  returns: lessonNodeMutationResultValidator,
  handler: async (ctx, args) => {
    const node = await getLessonNodeOrThrow(ctx.db, args.nodeId);
    const updatedAt = Date.now();
    const patch: Partial<
      Pick<
        Awaited<ReturnType<typeof getLessonNodeOrThrow>>,
        "title" | "slug" | "status" | "updatedAt"
      >
    > = { updatedAt };

    if (args.title !== undefined) {
      patch.title = normalizeRequired(args.title, "title");
    }

    if (args.slug !== undefined) {
      const requestedSlug = normalizeRequired(args.slug, "slug");
      patch.slug = await buildUniqueSiblingSlug(
        ctx.db,
        node.subjectId,
        node.parentNodeId,
        requestedSlug,
        node._id
      );
    }

    if (args.status !== undefined) {
      patch.status = resolveNodeStatus(node.kind, args.status);
    }

    await ctx.db.patch(node._id, patch);

    return toNodeResult(node, {
      title: patch.title ?? node.title,
      slug: patch.slug ?? node.slug,
      status: patch.status !== undefined ? patch.status : node.status,
      updatedAt,
    });
  },
});

export const move = mutation({
  args: {
    nodeId: v.id("lessonNodes"),
    targetGroupId: v.optional(v.id("lessonGroups")),
    targetParentNodeId: v.optional(v.union(v.id("lessonNodes"), v.null())),
  },
  returns: lessonNodeMutationResultValidator,
  handler: async (ctx, args) => {
    const node = await getLessonNodeOrThrow(ctx.db, args.nodeId);
    const sourceGroupId = node.groupId;
    const sourceParentNodeId = node.parentNodeId;
    const targetGroupId = args.targetGroupId ?? node.groupId;
    const targetParentNodeId =
      args.targetParentNodeId === undefined
        ? node.parentNodeId
        : args.targetParentNodeId;

    const targetGroup = await getLessonGroupOrThrow(ctx.db, targetGroupId);
    if (targetGroup.subjectId !== node.subjectId) {
      throw new Error("Target group must belong to the same subject.");
    }

    await assertParentNodeForChild(
      ctx.db,
      node.subjectId,
      targetGroupId,
      targetParentNodeId
    );

    if (targetParentNodeId) {
      await assertNoNodeCycle(ctx.db, node._id, targetParentNodeId);
    }

    const order = await getNextLessonNodeOrder(
      ctx.db,
      node.subjectId,
      targetGroupId,
      targetParentNodeId
    );
    const resolvedSlug = await buildUniqueSiblingSlug(
      ctx.db,
      node.subjectId,
      targetParentNodeId,
      node.slug,
      node._id
    );
    const updatedAt = Date.now();

    await ctx.db.patch(node._id, {
      groupId: targetGroupId,
      parentNodeId: targetParentNodeId,
      slug: resolvedSlug,
      order,
      updatedAt,
    });

    if (targetGroupId !== sourceGroupId) {
      await reassignSubtreeGroup(
        ctx.db,
        node.subjectId,
        sourceGroupId,
        targetGroupId,
        node._id,
        updatedAt
      );
    }

    await reindexSiblingOrders(
      ctx.db,
      node.subjectId,
      sourceGroupId,
      sourceParentNodeId
    );
    if (
      sourceGroupId !== targetGroupId ||
      sourceParentNodeId !== targetParentNodeId
    ) {
      await reindexSiblingOrders(
        ctx.db,
        node.subjectId,
        targetGroupId,
        targetParentNodeId
      );
    }
    const movedNode = await getLessonNodeOrThrow(ctx.db, node._id);

    return toNodeResult(movedNode);
  },
});

export const reorder = mutation({
  args: {
    subjectId: v.id("subjects"),
    groupId: v.id("lessonGroups"),
    parentNodeId: v.optional(v.union(v.id("lessonNodes"), v.null())),
    orderedNodeIds: v.array(v.id("lessonNodes")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const parentNodeId = args.parentNodeId ?? null;
    await assertParentNodeForChild(
      ctx.db,
      args.subjectId,
      args.groupId,
      parentNodeId
    );

    const siblings = await ctx.db
      .query("lessonNodes")
      .withIndex("by_subjectId_and_groupId_and_parentNodeId_and_order", (q) =>
        q
          .eq("subjectId", args.subjectId)
          .eq("groupId", args.groupId)
          .eq("parentNodeId", parentNodeId)
      )
      .collect();

    const uniqueOrderedIds = new Set(args.orderedNodeIds);
    if (uniqueOrderedIds.size !== args.orderedNodeIds.length) {
      throw new Error("orderedNodeIds must not contain duplicates.");
    }

    const validSiblingIds = new Set(siblings.map((node) => node._id));
    for (const nodeId of args.orderedNodeIds) {
      if (!validSiblingIds.has(nodeId)) {
        throw new Error(`Node "${nodeId}" is not a sibling in this container.`);
      }
    }

    let order = 0;
    const touched = new Set(args.orderedNodeIds);

    for (const nodeId of args.orderedNodeIds) {
      await ctx.db.patch(nodeId, { order });
      order += 1;
    }

    // Partial reorder contract: siblings not listed in orderedNodeIds keep their
    // relative order and are appended after the explicitly ordered nodes.
    for (const node of siblings) {
      if (touched.has(node._id)) {
        continue;
      }
      await ctx.db.patch(node._id, { order });
      order += 1;
    }

    return null;
  },
});

export const removeNode = mutation({
  args: {
    nodeId: v.id("lessonNodes"),
  },
  returns: removeNodeResultValidator,
  handler: async (ctx, args) => {
    const node = await getLessonNodeOrThrow(ctx.db, args.nodeId);

    if (node.kind === "lesson") {
      const child = await ctx.db
        .query("lessonNodes")
        .withIndex("by_subjectId_and_groupId_and_parentNodeId_and_order", (q) =>
          q
            .eq("subjectId", node.subjectId)
            .eq("groupId", node.groupId)
            .eq("parentNodeId", node._id)
        )
        .first();
      if (child) {
        throw new Error(
          "Lesson nodes cannot have children. Use removeSubtree for recovery."
        );
      }

      const content = await ctx.db
        .query("lessonContent")
        .withIndex("by_nodeId", (q) => q.eq("nodeId", node._id))
        .unique();
      if (content) {
        await ctx.db.delete(content._id);
      }
      await ctx.db.delete(node._id);
      await reindexSiblingOrders(
        ctx.db,
        node.subjectId,
        node.groupId,
        node.parentNodeId
      );
      return { deletedNodeIds: [node._id] };
    }

    const deletedNodeIds = await deleteSubtree(ctx.db, node._id);
    await reindexSiblingOrders(
      ctx.db,
      node.subjectId,
      node.groupId,
      node.parentNodeId
    );
    return { deletedNodeIds };
  },
});

export const removeSubtree = mutation({
  args: {
    nodeId: v.id("lessonNodes"),
  },
  returns: removeNodeResultValidator,
  handler: async (ctx, args) => {
    const root = await getLessonNodeOrThrow(ctx.db, args.nodeId);
    const deletedNodeIds = await deleteSubtree(ctx.db, args.nodeId);

    await reindexSiblingOrders(
      ctx.db,
      root.subjectId,
      root.groupId,
      root.parentNodeId
    );

    return { deletedNodeIds };
  },
});
