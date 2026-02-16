"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo } from "react";
import type { LessonGroup, LessonNode } from "./types";

interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface SubjectSidebarContextValue {
  breadcrumbItems: BreadcrumbItem[];
  lessonGroups: LessonGroup[];
  status: "loading" | "ready";
  subjectSlug: string;
}

const SubjectSidebarContext = createContext<SubjectSidebarContextValue | null>(
  null
);

const slugToLabel = (slug: string) => {
  return decodeURIComponent(slug).replace(/-/g, " ");
};

const getLessonSlugFromHref = (href?: string) => {
  if (!href) {
    return null;
  }

  const segments = href.split("/").filter(Boolean);
  return segments[1] ?? null;
};

const findLessonTrail = (
  nodes: LessonNode[],
  lessonSlug: string,
  trail: LessonNode[] = []
): LessonNode[] | null => {
  for (const node of nodes) {
    const nextTrail = [...trail, node];
    if (getLessonSlugFromHref(node.href) === lessonSlug) {
      return nextTrail;
    }

    if (!node.items?.length) {
      continue;
    }

    const nestedMatch = findLessonTrail(node.items, lessonSlug, nextTrail);
    if (nestedMatch) {
      return nestedMatch;
    }
  }

  return null;
};

interface SubjectSidebarProviderProps {
  children: React.ReactNode;
  subjectId: Id<"subjects">;
  subjectName: string;
  subjectSlug: string;
}

export function SubjectSidebarProvider({
  children,
  subjectId,
  subjectName,
  subjectSlug,
}: SubjectSidebarProviderProps) {
  const sidebarTree = useQuery(api.lessons.getSidebarTreeById, {
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

    const segments = pathname.split("/").filter(Boolean);
    const lessonSlug =
      segments.length > 1 && segments[0] === subjectSlug ? segments[1] : null;

    const breadcrumbItems: BreadcrumbItem[] = [
      {
        title: subjectName,
        href: `/${subjectSlug}`,
      },
    ];

    if (!lessonSlug) {
      return {
        breadcrumbItems,
        lessonGroups,
        status,
        subjectSlug,
      };
    }

    if (!sidebarTree) {
      return {
        breadcrumbItems: [
          ...breadcrumbItems,
          { title: slugToLabel(lessonSlug), href: pathname },
        ],
        lessonGroups,
        status,
        subjectSlug,
      };
    }

    let lessonTrail: LessonNode[] = [];
    for (const group of sidebarTree.groups) {
      const match = findLessonTrail(group.items as LessonNode[], lessonSlug);
      if (match) {
        lessonTrail = match;
        break;
      }
    }

    if (lessonTrail.length === 0) {
      return {
        breadcrumbItems: [
          ...breadcrumbItems,
          { title: slugToLabel(lessonSlug), href: pathname },
        ],
        lessonGroups,
        status,
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
