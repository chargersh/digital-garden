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

const buildNodeHref = (
  subjectSlug: string,
  routePrefix: string,
  pathSegments: string[]
) => {
  const encodedPath = pathSegments.map(encodeURIComponent).join("/");
  return withRoutePrefix(`/${subjectSlug}/${encodedPath}`, routePrefix);
};

export const mapSidebarNodeForRoute = (
  node: LessonNode,
  subjectSlug: string,
  routePrefix: string,
  parentPathSegments: string[] = []
): LessonNode => {
  const pathSegments = [...parentPathSegments, node.slug];
  const nested = node.items?.map((item) =>
    mapSidebarNodeForRoute(item, subjectSlug, routePrefix, pathSegments)
  );

  const href =
    node.kind === "lesson"
      ? buildNodeHref(subjectSlug, routePrefix, pathSegments)
      : undefined;

  const items = nested && nested.length > 0 ? nested : undefined;

  return {
    ...node,
    href,
    items,
  };
};

export const getLessonPathFromPathname = (
  pathname: string,
  subjectSlug: string,
  routePrefix: string
) => {
  const segments = pathname.split("/").filter(Boolean);
  const prefixSegments = routePrefix.split("/").filter(Boolean);
  const subjectIndex = prefixSegments.length;

  if (segments[subjectIndex] !== subjectSlug) {
    return [];
  }

  return segments.slice(subjectIndex + 1);
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
