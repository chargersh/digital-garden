import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/sidebar/app-sidebar";

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
      <AppSidebar subjectId={subject._id} subjectSlug={subjectSlug} />
      <SidebarInset>
        <PageHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
