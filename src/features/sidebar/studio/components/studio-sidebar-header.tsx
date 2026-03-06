"use client";

import type { Id } from "@convex/_generated/dataModel";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col gap-3">
      <SubjectSelector subjectName={subjectName} subjectSlug={subjectSlug} />
      <Button asChild variant="outline">
        <Link href={`/${subjectSlug}`}>
          <ArrowLeftIcon aria-hidden="true" />
          Back to Garden
        </Link>
      </Button>
      <CreateLessonGroupDialog subjectId={subjectId} />
    </div>
  );
}
