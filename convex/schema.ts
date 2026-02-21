import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { difficultyValidator } from "./validators";

export default defineSchema({
  subjects: defineTable({
    uid: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.union(v.string(), v.null()),
    order: v.number(),
  })
    .index("by_uid", ["uid"])
    .index("by_slug", ["slug"])
    .index("by_order", ["order"]),

  lessonGroups: defineTable({
    uid: v.string(),
    subjectId: v.id("subjects"),
    title: v.string(),
    slug: v.string(),
    order: v.number(),
    isDefault: v.boolean(),
  })
    .index("by_subjectId_and_uid", ["subjectId", "uid"])
    .index("by_subjectId_and_order", ["subjectId", "order"])
    .index("by_subjectId_and_slug", ["subjectId", "slug"])
    .index("by_subjectId_and_isDefault", ["subjectId", "isDefault"]),

  lessonNodes: defineTable({
    uid: v.string(),
    subjectId: v.id("subjects"),
    groupId: v.id("lessonGroups"),
    parentNodeId: v.union(v.id("lessonNodes"), v.null()),
    kind: v.union(v.literal("lesson"), v.literal("collapsible")),
    title: v.string(),
    slug: v.string(),
    order: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived"),
      v.null()
    ),
    updatedAt: v.number(),
  })
    .index("by_subjectId_and_uid", ["subjectId", "uid"])
    .index("by_subjectId_and_groupId_and_parentNodeId_and_order", [
      "subjectId",
      "groupId",
      "parentNodeId",
      "order",
    ])
    .index("by_subjectId_and_parentNodeId_and_slug", [
      "subjectId",
      "parentNodeId",
      "slug",
    ])
    .index("by_subjectId_and_groupId_and_kind", [
      "subjectId",
      "groupId",
      "kind",
    ]),

  lessonContent: defineTable({
    nodeId: v.id("lessonNodes"),
    description: v.string(),
    bodyMdx: v.string(),
    difficulty: difficultyValidator,
    summary: v.union(v.string(), v.null()),
    updatedAt: v.number(),
  }).index("by_nodeId", ["nodeId"]),
});
