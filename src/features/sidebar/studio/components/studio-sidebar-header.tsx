"use client";

import { SubjectSelector } from "@/features/sidebar/shared/components/subject-selector";

interface StudioSidebarHeaderProps {
  subjectName: string;
  subjectSlug: string;
}

export function StudioSidebarHeader({
  subjectName,
  subjectSlug,
}: StudioSidebarHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <SubjectSelector subjectName={subjectName} subjectSlug={subjectSlug} />
    </div>
  );
}
