"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo } from "react";
import {
  buildSubjectHref,
  findLessonTrail,
  getLessonPathFromPathname,
  getRoutePrefixFromPathname,
  mapSidebarNodeForRoute,
  normalizePathname,
  slugToLabel,
} from "./sidebar-utils";
import type { LessonGroup, LessonNode } from "./types";

interface BreadcrumbItem {
  href?: string;
  title: string;
}

interface SubjectSidebarContextValue {
  breadcrumbItems: BreadcrumbItem[];
  lessonGroups: LessonGroup[];
  status: "loading" | "ready";
  subjectHref: string;
  subjectName: string;
  subjectSlug: string;
}

const SubjectSidebarContext = createContext<SubjectSidebarContextValue | null>(
  null
);

interface SubjectSidebarProviderProps {
  children: React.ReactNode;
  includeUnpublished?: boolean;
  subjectId: Id<"subjects">;
  subjectName: string;
  subjectSlug: string;
}

export function SubjectSidebarProvider({
  children,
  includeUnpublished = false,
  subjectId,
  subjectName,
  subjectSlug,
}: SubjectSidebarProviderProps) {
  const sidebarTree = useQuery(api.lessonNodes.getSidebarTreeBySubject, {
    includeUnpublished,
    subjectId,
  });
  const pathname = usePathname();

  const value = useMemo<SubjectSidebarContextValue>(() => {
    const status: "loading" | "ready" =
      sidebarTree === undefined ? "loading" : "ready";

    const normalizedPathname = normalizePathname(pathname);
    const routePrefix = getRoutePrefixFromPathname(normalizedPathname);
    const lessonPathParts = getLessonPathFromPathname(
      normalizedPathname,
      subjectSlug,
      routePrefix
    );
    const subjectHref = buildSubjectHref(subjectSlug, routePrefix);

    const lessonGroups: LessonGroup[] = sidebarTree
      ? sidebarTree.groups.map((group) => ({
          title: group.title,
          order: group.order,
          id: `group-${group.uid}`,
          items: group.items.map((item) =>
            mapSidebarNodeForRoute(item, subjectSlug, routePrefix)
          ),
        }))
      : [];

    const breadcrumbItems: BreadcrumbItem[] = [
      {
        title: subjectName,
        href: subjectHref,
      },
    ];

    if (lessonPathParts.length === 0) {
      return {
        breadcrumbItems,
        lessonGroups,
        status,
        subjectHref,
        subjectName,
        subjectSlug,
      };
    }

    if (!sidebarTree) {
      const fallbackSegment = lessonPathParts.at(-1) ?? "";

      return {
        breadcrumbItems: [
          ...breadcrumbItems,
          { title: slugToLabel(fallbackSegment), href: normalizedPathname },
        ],
        lessonGroups,
        status,
        subjectHref,
        subjectName,
        subjectSlug,
      };
    }

    let lessonTrail: LessonNode[] = [];
    for (const group of lessonGroups) {
      const match = findLessonTrail(group.items, normalizedPathname);
      if (match) {
        lessonTrail = match;
        break;
      }
    }

    if (lessonTrail.length === 0) {
      const fallbackSegment = lessonPathParts.at(-1) ?? "";

      return {
        breadcrumbItems: [
          ...breadcrumbItems,
          { title: slugToLabel(fallbackSegment), href: normalizedPathname },
        ],
        lessonGroups,
        status,
        subjectHref,
        subjectName,
        subjectSlug,
      };
    }

    return {
      breadcrumbItems: [
        ...breadcrumbItems,
        ...lessonTrail.map((node) => ({
          title: node.title,
          href: node.href,
        })),
      ],
      lessonGroups,
      status,
      subjectHref,
      subjectName,
      subjectSlug,
    };
  }, [pathname, sidebarTree, subjectName, subjectSlug]);

  return (
    <SubjectSidebarContext.Provider value={value}>
      {children}
    </SubjectSidebarContext.Provider>
  );
}

export function useSubjectSidebar() {
  const value = useContext(SubjectSidebarContext);
  if (!value) {
    throw new Error(
      "useSubjectSidebar must be used within SubjectSidebarProvider."
    );
  }
  return value;
}
