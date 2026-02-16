import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  getSubjectBySlug,
  getSubjectSidebarTree,
} from "@/features/convex/server-queries";
import { AppSidebar } from "@/features/sidebar/app-sidebar";
import type { LessonGroup } from "@/features/sidebar/types";

interface SubjectLayoutProps {
  children: ReactNode;
  params: Promise<{
    subject: string;
  }>;
}

export default async function SubjectLayout({
  children,
  params,
}: SubjectLayoutProps) {
  const { subject: subjectSlug } = await params;
  const subject = await getSubjectBySlug(subjectSlug);

  if (!subject) {
    notFound();
  }

  const sidebarTree = await getSubjectSidebarTree(subject._id);
  const lessonGroups: LessonGroup[] = [...sidebarTree.groups]
    .sort((left, right) => left.order - right.order)
    .map((group) => ({
      title: group.title,
      order: group.order,
      id: `group-${group.uid}`,
      items: group.items,
    }));

  return (
    <SidebarProvider>
      <AppSidebar lessonGroups={lessonGroups} />
      <SidebarInset>
        <PageHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
