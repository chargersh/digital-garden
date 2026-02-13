import type { LessonNode } from "./components/lesson-tree";

interface LessonGroupData {
  title: string;
  id?: string;
  items: LessonNode[];
}

export const lessonGroups: LessonGroupData[] = [
  {
    title: "Learning",
    id: "sidebar-title",
    items: [
      {
        title: "Math",
        dataTitle: "Math",
        defaultOpen: true,
        items: [
          {
            title: "Domain of a Function",
            href: "/math/domain",
            isActive: true,
          },
        ],
      },
    ],
  },
  {
    title: "Roadmap",
    id: "sidebar-title-roadmap",
    items: [
      {
        title: "Future Topics",
        dataTitle: "Future Topics",
        defaultOpen: true,
        items: [
          {
            title: "Limits (coming soon)",
            href: "/math/domain",
            id: "roadmap-limits",
          },
          {
            title: "Continuity (coming soon)",
            href: "/math/domain",
            id: "roadmap-continuity",
          },
        ],
      },
      {
        title: "Convex Integration (planned)",
        href: "/math/domain",
        id: "roadmap-convex",
      },
    ],
  },
];
