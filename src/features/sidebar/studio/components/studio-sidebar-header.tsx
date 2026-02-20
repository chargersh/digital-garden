"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col gap-3">
      <SubjectSelector subjectName={subjectName} subjectSlug={subjectSlug} />
      <Button asChild className="w-full justify-center">
        <Link href={`/studio/${subjectSlug}/create`}>Create lesson</Link>
      </Button>
      <Button asChild className="w-full justify-center" variant="outline">
        <Link href={`/${subjectSlug}`}>Back to main app</Link>
      </Button>
    </div>
  );
}
