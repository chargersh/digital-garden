import "server-only";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";

export const getSubjects = async () => {
  return await fetchQuery(api.subjects.list, {});
};

export const getSubjectBySlug = async (slug: string) => {
  return await fetchQuery(api.subjects.getBySlug, { slug });
};

export const getLessonByRoute = async (
  subjectSlug: string,
  lessonSlug: string
) => {
  return await fetchQuery(api.lessons.getByRoute, {
    subjectSlug,
    lessonSlug,
    includeUnpublished: false,
  });
};

export const getSubjectSidebarTree = async (subjectId: Id<"subjects">) => {
  return await fetchQuery(api.lessons.getSidebarTree, {
    subjectId,
    includeUnpublished: false,
  });
};
