"use client";

import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSubjectSidebar } from "@/features/sidebar/subject-sidebar-context";
import { SidebarLessonGroup } from "./components/lesson-group";
import { LessonItem } from "./components/lesson-item";

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const { lessonGroups, status, subjectSlug } = useSubjectSidebar();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Documentation</span>
                  <span className="text-muted-foreground text-xs">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="custom-scrollbar stable-scrollbar-gutter flex-1 overflow-y-auto pb-6">
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
          lessonGroups.map((group, index) => (
            <SidebarLessonGroup
              className={index === 0 ? "mt-0 lg:mt-0" : undefined}
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
