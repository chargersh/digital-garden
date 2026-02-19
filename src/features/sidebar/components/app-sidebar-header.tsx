"use client";

import { SubjectSelector } from "./subject-selector";

interface AppSidebarHeaderProps {
  subjectSlug: string;
}

export function AppSidebarHeader({ subjectSlug }: AppSidebarHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <SubjectSelector subjectSlug={subjectSlug} />
    </div>
  );
}
