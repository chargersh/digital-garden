import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { compileMdxFile } from "@/features/mdx/compile";
import type {
  CompiledLessonContent,
  LessonDifficulty,
  LessonFrontmatter,
  LessonStatus,
} from "@/features/mdx/types";

const mockLessonPath = path.join(process.cwd(), "src", "mock", "lesson.mdx");
const canonicalSubject = "math";
const canonicalLesson = "domain";
const canonicalUrl = `/${canonicalSubject}/${canonicalLesson}`;

const difficultyValues: LessonDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];
const statusValues: LessonStatus[] = ["draft", "published", "archived"];

const isString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

const normalizeIsoDate = (value: unknown): string | null => {
  if (isString(value)) {
    return Number.isNaN(Date.parse(value)) ? null : value;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  return null;
};

const parseFrontmatter = (
  value: Record<string, unknown>,
  filePath: string
): LessonFrontmatter => {
  const requiredString = (key: string): string => {
    const raw = value[key];
    if (!isString(raw)) {
      throw new Error(
        `Frontmatter "${key}" must be a non-empty string: ${filePath}`
      );
    }

    return raw;
  };

  const title = requiredString("title");
  const description = requiredString("description");
  const subject = requiredString("subject");
  const lessonSlug = requiredString("lessonSlug");
  const updatedAt = normalizeIsoDate(value.updatedAt);
  if (!updatedAt) {
    throw new Error(
      `Frontmatter "updatedAt" must be a valid ISO date: ${filePath}`
    );
  }

  const orderValue = value.order;
  if (typeof orderValue !== "number" || Number.isNaN(orderValue)) {
    throw new Error(`Frontmatter "order" must be a number: ${filePath}`);
  }

  const difficultyValue = value.difficulty;
  if (
    typeof difficultyValue !== "string" ||
    !difficultyValues.includes(difficultyValue as LessonDifficulty)
  ) {
    throw new Error(
      `Frontmatter "difficulty" must be one of ${difficultyValues.join(", ")}: ${filePath}`
    );
  }

  const statusValue = value.status;
  if (
    typeof statusValue !== "string" ||
    !statusValues.includes(statusValue as LessonStatus)
  ) {
    throw new Error(
      `Frontmatter "status" must be one of ${statusValues.join(", ")}: ${filePath}`
    );
  }

  const tagsValue = value.tags;
  if (
    !(
      Array.isArray(tagsValue) &&
      tagsValue.every((item) => typeof item === "string")
    )
  ) {
    throw new Error(`Frontmatter "tags" must be a string[]: ${filePath}`);
  }

  const estimatedMinutes =
    typeof value.estimatedMinutes === "number" &&
    Number.isFinite(value.estimatedMinutes)
      ? value.estimatedMinutes
      : undefined;

  const summary = isString(value.summary) ? value.summary : undefined;

  return {
    title,
    description,
    subject,
    lessonSlug,
    order: orderValue,
    difficulty: difficultyValue as LessonDifficulty,
    tags: tagsValue,
    status: statusValue as LessonStatus,
    updatedAt,
    estimatedMinutes,
    summary,
  };
};

export const getCanonicalLessonRoute = () => {
  return {
    lesson: canonicalLesson,
    subject: canonicalSubject,
    url: canonicalUrl,
  };
};

export const getMockLesson = async (): Promise<CompiledLessonContent> => {
  const [rawBuffer, fileStats] = await Promise.all([
    readFile(mockLessonPath),
    stat(mockLessonPath),
  ]);

  const parsed = matter(rawBuffer.toString());
  const frontmatter = parseFrontmatter(
    parsed.data as Record<string, unknown>,
    mockLessonPath
  );

  if (
    frontmatter.subject !== canonicalSubject ||
    frontmatter.lessonSlug !== canonicalLesson
  ) {
    throw new Error(
      `Mock lesson frontmatter subject/lessonSlug must be "${canonicalSubject}/${canonicalLesson}": ${mockLessonPath}`
    );
  }

  const compiled = await compileMdxFile({
    filePath: mockLessonPath,
    source: parsed.content,
    cacheKey: `${mockLessonPath}:${fileStats.mtimeMs}:${parsed.content.length}`,
  });

  return {
    body: compiled.body,
    toc: compiled.toc,
    frontmatter,
    canonicalUrl,
    sourcePath: mockLessonPath,
  };
};
