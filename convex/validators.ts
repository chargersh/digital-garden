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
