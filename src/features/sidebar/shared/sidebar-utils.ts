import type { LessonNode } from "./types";

const TRAILING_SLASHES = /\/+$/;
const STUDIO_SEGMENT = "studio";

export const slugToLabel = (slug: string) => {
  return decodeURIComponent(slug).replace(/-/g, " ");
};

export const normalizePathname = (pathname: string) => {
  const normalized = pathname.replace(TRAILING_SLASHES, "");
  return normalized.length > 0 ? normalized : "/";
};

export const getRoutePrefixFromPathname = (pathname: string) => {
  const normalizedPathname = normalizePathname(pathname);
  const segments = normalizedPathname.split("/").filter(Boolean);
  return segments[0] === STUDIO_SEGMENT ? "/studio" : "";
};

export const buildSubjectHref = (subjectSlug: string, routePrefix: string) => {
  return `${routePrefix}/${subjectSlug}`;
};

export const withRoutePrefix = (href: string, routePrefix: string) => {
  return routePrefix ? `${routePrefix}${href}` : href;
};

export const mapNodeForRoute = (
  node: LessonNode,
  routePrefix: string
): LessonNode => {
  return {
    ...node,
    href: node.href ? withRoutePrefix(node.href, routePrefix) : undefined,
    items: node.items?.map((item) => mapNodeForRoute(item, routePrefix)),
  };
};

export const getLessonSlugFromPathname = (
  pathname: string,
  subjectSlug: string,
  routePrefix: string
) => {
  const segments = pathname.split("/").filter(Boolean);
  const prefixSegments = routePrefix.split("/").filter(Boolean);
  const subjectIndex = prefixSegments.length;

  if (segments[subjectIndex] !== subjectSlug) {
    return null;
  }

  return segments[subjectIndex + 1] ?? null;
};

export const findLessonTrail = (
  nodes: LessonNode[],
  pathname: string,
  trail: LessonNode[] = []
): LessonNode[] | null => {
  for (const node of nodes) {
    const nextTrail = [...trail, node];
    if (node.href && normalizePathname(node.href) === pathname) {
      return nextTrail;
    }

    if (!node.items?.length) {
      continue;
    }

    const nestedMatch = findLessonTrail(node.items, pathname, nextTrail);
    if (nestedMatch) {
      return nestedMatch;
    }
  }

  return null;
};

export const getStudioStatusBorderClass = (
  status?: "archived" | "draft" | "published"
) => {
  if (status === "draft") {
    return "border-yellow-500";
  }

  if (status === "archived") {
    return "border-red-500";
  }

  return "";
};
