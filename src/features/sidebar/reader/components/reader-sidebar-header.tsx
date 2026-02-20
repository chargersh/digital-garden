"use client";

import { SubjectSelector } from "@/features/sidebar/shared/components/subject-selector";

interface ReaderSidebarHeaderProps {
  subjectName: string;
  subjectSlug: string;
}

export function ReaderSidebarHeader({
  subjectName,
  subjectSlug,
}: ReaderSidebarHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <SubjectSelector subjectName={subjectName} subjectSlug={subjectSlug} />
    </div>
  );
}
