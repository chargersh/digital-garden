import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/sidebar/app-sidebar";
import { SubjectSidebarProvider } from "@/features/sidebar/subject-sidebar-context";

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
  const subject = await fetchQuery(api.subjects.getBySlug, {
    slug: subjectSlug,
  });

  if (!subject) {
    notFound();
  }

  return (
    <SidebarProvider>
      <SubjectSidebarProvider
        subjectId={subject._id}
        subjectName={subject.name}
        subjectSlug={subject.slug}
      >
        <AppSidebar />
        <SidebarInset>
          <PageHeader />
          {children}
        </SidebarInset>
      </SubjectSidebarProvider>
    </SidebarProvider>
  );
}
