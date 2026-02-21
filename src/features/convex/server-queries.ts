import "server-only";
import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export const getLessonByPath = async (
  subjectSlug: string,
  pathParts: string[],
  options?: {
    includeUnpublished?: boolean;
  }
) => {
  return await fetchQuery(api.lessonNodes.getLessonByPath, {
    subjectSlug,
    pathParts,
    includeUnpublished: options?.includeUnpublished ?? false,
  });
};

export const getSubjectBySlug = async (subjectSlug: string) => {
  return await fetchQuery(api.subjects.getBySlug, {
    slug: subjectSlug,
  });
};
