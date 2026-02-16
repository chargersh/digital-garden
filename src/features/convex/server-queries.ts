import "server-only";
import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

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

export const getSubjectBySlug = async (subjectSlug: string) => {
  return await fetchQuery(api.subjects.getBySlug, {
    slug: subjectSlug,
  });
};
