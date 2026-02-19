"use client";

import type { ComponentProps } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useSubjectSidebar } from "@/features/sidebar/subject-sidebar-context";
import { AppSidebarHeader } from "./components/app-sidebar-header";
import { SidebarLessonGroup } from "./components/lesson-group";
import { LessonItem } from "./components/lesson-item";

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const { lessonGroups, status, subjectSlug } = useSubjectSidebar();

  return (
    <Sidebar {...props}>
      <SidebarHeader className="px-4">
        <AppSidebarHeader subjectSlug={subjectSlug} />
        <div aria-hidden="true" className="mt-2 border-b" />
      </SidebarHeader>
      <SidebarContent className="custom-scrollbar stable-scrollbar-gutter flex-1 overflow-y-auto pt-2 pb-6">
        {status === "loading" && (
          <div className="px-4 py-3 text-muted-foreground text-sm">
            Loading...
          </div>
        )}
        {status === "ready" && (
          <LessonItem
            className="mt-0 lg:mt-0"
            href={`/${subjectSlug}`}
            id={`overview-${subjectSlug}`}
            title="Overview"
          />
        )}
        {status === "ready" && lessonGroups.length === 0 && (
          <div className="px-4 py-3 text-muted-foreground text-sm">
            No lessons yet.
          </div>
        )}
        {status === "ready" &&
          lessonGroups.length > 0 &&
          lessonGroups.map((group) => (
            <SidebarLessonGroup
              id={group.id}
              items={group.items}
              key={group.id}
              title={group.title}
            />
          ))}
      </SidebarContent>
    </Sidebar>
  );
}
