"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo } from "react";
import {
  buildSubjectHref,
  findLessonTrail,
  getLessonSlugFromPathname,
  getRoutePrefixFromPathname,
  mapNodeForRoute,
  normalizePathname,
  slugToLabel,
} from "./sidebar-utils";
import type { LessonGroup, LessonNode } from "./types";

interface BreadcrumbItem {
  title: string;
  href?: string;
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
  const sidebarTree = useQuery(api.lessons.getSidebarTreeById, {
    includeUnpublished,
    subjectId,
  });
  const pathname = usePathname();

  const value = useMemo<SubjectSidebarContextValue>(() => {
    const status: "loading" | "ready" =
      sidebarTree === undefined ? "loading" : "ready";

    const lessonGroups: LessonGroup[] = sidebarTree
      ? sidebarTree.groups.map((group) => ({
          title: group.title,
          order: group.order,
          id: `group-${group.uid}`,
          items: group.items,
        }))
      : [];

    const normalizedPathname = normalizePathname(pathname);
    const routePrefix = getRoutePrefixFromPathname(normalizedPathname);
    const lessonSlug = getLessonSlugFromPathname(
      normalizedPathname,
      subjectSlug,
      routePrefix
    );
    const subjectHref = buildSubjectHref(subjectSlug, routePrefix);
    const routedLessonGroups = lessonGroups.map((group) => ({
      ...group,
      items: group.items.map((item) => mapNodeForRoute(item, routePrefix)),
    }));

    const breadcrumbItems: BreadcrumbItem[] = [
      {
        title: subjectName,
        href: subjectHref,
      },
    ];

    if (!lessonSlug) {
      return {
        breadcrumbItems,
        lessonGroups: routedLessonGroups,
        status,
        subjectHref,
        subjectName,
        subjectSlug,
      };
    }

    if (!sidebarTree) {
      return {
        breadcrumbItems: [
          ...breadcrumbItems,
          { title: slugToLabel(lessonSlug), href: normalizedPathname },
        ],
        lessonGroups: routedLessonGroups,
        status,
        subjectHref,
        subjectName,
        subjectSlug,
      };
    }

    let lessonTrail: LessonNode[] = [];
    for (const group of routedLessonGroups) {
      const match = findLessonTrail(group.items, normalizedPathname);
      if (match) {
        lessonTrail = match;
        break;
      }
    }

    if (lessonTrail.length === 0) {
      return {
        breadcrumbItems: [
          ...breadcrumbItems,
          { title: slugToLabel(lessonSlug), href: normalizedPathname },
        ],
        lessonGroups: routedLessonGroups,
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
      lessonGroups: routedLessonGroups,
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
