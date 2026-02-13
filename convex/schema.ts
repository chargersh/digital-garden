import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { difficultyValidator, lessonStatusValidator } from "./validators";

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

  lessons: defineTable({
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
  })
    .index("by_subjectId_and_uid", ["subjectId", "uid"])
    .index("by_subjectId_and_lessonSlug", ["subjectId", "lessonSlug"])
    .index("by_subjectId_and_groupId_and_parentLessonId_and_order", [
      "subjectId",
      "groupId",
      "parentLessonId",
      "order",
    ])
    .index("by_subjectId_and_status", ["subjectId", "status"]),
});
