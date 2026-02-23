"use client";

import { ArrowRightIcon } from "lucide-react";
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
      <Button asChild>
        <Link href={`/studio/${subjectSlug}`}>
          <ArrowRightIcon aria-hidden="true" />
          Go to Studio
        </Link>
      </Button>
    </div>
  );
}
