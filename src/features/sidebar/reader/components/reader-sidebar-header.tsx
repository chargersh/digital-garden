"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col gap-3">
      <SubjectSelector subjectName={subjectName} subjectSlug={subjectSlug} />
      <Button asChild className="w-full justify-center">
        <Link href={`/studio/${subjectSlug}`}>Open studio</Link>
      </Button>
    </div>
  );
}
