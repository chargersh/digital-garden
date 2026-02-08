import type { LessonNode } from "./components/lesson-tree";

interface LessonGroupData {
  title: string;
  id?: string;
  items: LessonNode[];
}

export const lessonGroups: LessonGroupData[] = [
  {
    title: "Study of a Function",
    id: "sidebar-title",
    items: [
      {
        title: "Domain of a function",
        href: "/study/domain",
      },
      {
        title: "Axis intercepts",
        href: "/study/intercepts",
      },
      {
        title: "Limits",
        items: [
          {
            title: "Epsilon-Delta Definition",
            href: "/study/limits/epsilon-delta",
          },
        ],
      },
      {
        title: "Continuity",
        href: "/study/continuity",
      },
    ],
  },
  {
    title: "Sequences & Series",
    id: "sidebar-title-sequences",
    items: [
      {
        title: "Sequences",
        items: [
          {
            title: "Definitions",
            href: "/sequences/definitions",
          },
        ],
      },
      {
        title: "Series",
        href: "/series",
        isActive: true,
      },
      {
        title: "Convergence Tests",
        href: "/series/tests",
      },
      {
        title: "Power Series",
        href: "/series/power",
      },
    ],
  },
  {
    title: "Derivatives",
    id: "sidebar-title-derivatives",
    items: [
      {
        title: "Definition",
        href: "/derivatives/definition",
      },
      {
        title: "Rules",
        items: [
          {
            title: "Product Rule",
            href: "/derivatives/rules/product",
          },
          {
            title: "Chain Rule",
            href: "/derivatives/rules/chain",
          },
        ],
      },
      {
        title: "Applications",
        href: "/derivatives/applications",
      },
      {
        title: "Implicit Differentiation",
        href: "/derivatives/implicit",
      },
    ],
  },
  {
    title: "Integrals",
    id: "sidebar-title-integrals",
    items: [
      {
        title: "Antiderivatives",
        href: "/integrals/antiderivatives",
      },
      {
        title: "Riemann Sums",
        href: "/integrals/riemann-sums",
      },
      {
        title: "Techniques",
        items: [
          {
            title: "Substitution",
            href: "/integrals/techniques/substitution",
          },
          {
            title: "Integration by Parts",
            href: "/integrals/techniques/parts",
          },
        ],
      },
      {
        title: "Applications",
        href: "/integrals/applications",
      },
    ],
  },
];
