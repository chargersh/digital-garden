import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getSubjectBySlug } from "@/features/convex/server-queries";
import { SubjectSidebarProvider } from "@/features/sidebar/shared/subject-sidebar-context";
import { StudioSidebar } from "@/features/sidebar/studio/studio-sidebar";

interface StudioSubjectLayoutProps {
  children: ReactNode;
  params: Promise<{
    subject: string;
  }>;
}

export default async function StudioSubjectLayout({
  children,
  params,
}: StudioSubjectLayoutProps) {
  const { subject: subjectSlug } = await params;
  const subject = await getSubjectBySlug(subjectSlug);

  if (!subject) {
    notFound();
  }

  return (
    <SidebarProvider>
      <SubjectSidebarProvider
        includeUnpublished
        subjectId={subject._id}
        subjectName={subject.name}
        subjectSlug={subject.slug}
      >
        <StudioSidebar />
        <SidebarInset>
          <PageHeader />
          {children}
        </SidebarInset>
      </SubjectSidebarProvider>
    </SidebarProvider>
  );
}
