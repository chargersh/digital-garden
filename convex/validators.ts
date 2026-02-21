import { v } from "convex/values";

export const difficultyValidator = v.union(
  v.literal("beginner"),
  v.literal("intermediate"),
  v.literal("advanced")
);

export const lessonStatusValidator = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived")
);

export const lessonNodeKindValidator = v.union(
  v.literal("lesson"),
  v.literal("collapsible")
);

export const lessonNodeStatusValidator = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
  v.null()
);

export const subjectFields = {
  _id: v.id("subjects"),
  uid: v.string(),
  name: v.string(),
  slug: v.string(),
  description: v.union(v.string(), v.null()),
  order: v.number(),
};

export const subjectValidator = v.object({
  ...subjectFields,
  _creationTime: v.number(),
});

export const subjectMutationResultValidator = v.object(subjectFields);

export const lessonGroupFields = {
  _id: v.id("lessonGroups"),
  uid: v.string(),
  subjectId: v.id("subjects"),
  title: v.string(),
  slug: v.string(),
  order: v.number(),
  isDefault: v.boolean(),
};

export const lessonGroupValidator = v.object({
  ...lessonGroupFields,
  _creationTime: v.number(),
});

export const lessonGroupMutationResultValidator = v.object(lessonGroupFields);

export const lessonFields = {
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
  updatedAt: v.number(),
  summary: v.union(v.string(), v.null()),
};

export const lessonValidator = v.object({
  ...lessonFields,
  _creationTime: v.number(),
});

export const lessonMutationResultValidator = v.object(lessonFields);

export const sidebarItemValidator = v.object({
  id: v.id("lessons"),
  uid: v.string(),
  title: v.string(),
  lessonSlug: v.string(),
  href: v.string(),
  status: lessonStatusValidator,
  // Convex validators don't support recursive types; nested SidebarNode[]
  // items are validated structurally in application code instead.
  items: v.optional(v.array(v.any())),
});

export const lessonGroupWithItemsValidator = v.object({
  ...lessonGroupFields,
  _creationTime: v.number(),
  items: v.array(sidebarItemValidator),
});

export const lessonNodeFields = {
  _id: v.id("lessonNodes"),
  uid: v.string(),
  subjectId: v.id("subjects"),
  groupId: v.id("lessonGroups"),
  parentNodeId: v.union(v.id("lessonNodes"), v.null()),
  kind: lessonNodeKindValidator,
  title: v.string(),
  slug: v.string(),
  order: v.number(),
  status: lessonNodeStatusValidator,
  updatedAt: v.number(),
};

export const lessonNodeValidator = v.object({
  ...lessonNodeFields,
  _creationTime: v.number(),
});

export const lessonNodeMutationResultValidator = v.object(lessonNodeFields);

export const lessonNodeSidebarItemValidator = v.object({
  id: v.id("lessonNodes"),
  uid: v.string(),
  kind: lessonNodeKindValidator,
  title: v.string(),
  slug: v.string(),
  status: lessonNodeStatusValidator,
  items: v.optional(v.array(v.any())),
});

export const lessonGroupWithNodeItemsValidator = v.object({
  ...lessonGroupFields,
  _creationTime: v.number(),
  items: v.array(lessonNodeSidebarItemValidator),
});

export const lessonContentFields = {
  _id: v.id("lessonContent"),
  nodeId: v.id("lessonNodes"),
  description: v.string(),
  bodyMdx: v.string(),
  difficulty: difficultyValidator,
  summary: v.union(v.string(), v.null()),
  updatedAt: v.number(),
};

export const lessonContentValidator = v.object({
  ...lessonContentFields,
  _creationTime: v.number(),
});

export const lessonContentMutationResultValidator =
  v.object(lessonContentFields);
