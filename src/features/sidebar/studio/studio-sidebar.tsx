"use client";

import type { ComponentProps } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { SubjectOverviewItem } from "@/features/sidebar/shared/components/subject-overview-item";
import { useSubjectSidebar } from "@/features/sidebar/shared/subject-sidebar-context";
import { StudioLessonGroup } from "./components/studio-lesson-group";
import { StudioSidebarHeader } from "./components/studio-sidebar-header";

export function StudioSidebar(props: ComponentProps<typeof Sidebar>) {
  const {
    lessonGroups,
    status,
    subjectHref,
    subjectId,
    subjectName,
    subjectSlug,
  } = useSubjectSidebar();

  return (
    <Sidebar {...props}>
      <SidebarHeader className="px-4">
        <StudioSidebarHeader
          subjectId={subjectId}
          subjectName={subjectName}
          subjectSlug={subjectSlug}
        />
        <div aria-hidden="true" className="mt-2 border-b" />
      </SidebarHeader>
      <SidebarContent className="custom-scrollbar stable-scrollbar-gutter flex-1 overflow-y-auto pt-2 pb-6">
        {status === "loading" && (
          <div className="px-4 py-3 text-muted-foreground text-sm">
            Loading...
          </div>
        )}
        {status === "ready" && (
          <SubjectOverviewItem className="mt-0 lg:mt-0" href={subjectHref} />
        )}
        {status === "ready" && lessonGroups.length === 0 && (
          <div className="px-4 py-3 text-muted-foreground text-sm">
            No lessons yet.
          </div>
        )}
        {status === "ready" &&
          lessonGroups.length > 0 &&
          lessonGroups.map((group) => (
            <StudioLessonGroup
              groupId={group.groupId}
              items={group.items}
              key={group.groupId}
              subjectId={subjectId}
              title={group.title}
            />
          ))}
      </SidebarContent>
    </Sidebar>
  );
}
