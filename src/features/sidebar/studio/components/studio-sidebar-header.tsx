"use client";

import type { Id } from "@convex/_generated/dataModel";
import { SubjectSelector } from "@/features/sidebar/shared/components/subject-selector";
import { CreateLessonGroupDialog } from "./create-lesson-group-dialog";

interface StudioSidebarHeaderProps {
  subjectId: Id<"subjects">;
  subjectName: string;
  subjectSlug: string;
}

export function StudioSidebarHeader({
  subjectId,
  subjectName,
  subjectSlug,
}: StudioSidebarHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <SubjectSelector subjectName={subjectName} subjectSlug={subjectSlug} />
      <CreateLessonGroupDialog subjectId={subjectId} />
    </div>
  );
}
