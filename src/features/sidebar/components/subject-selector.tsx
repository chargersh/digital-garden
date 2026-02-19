"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { BookOpenIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SubjectSelectorProps {
  subjectSlug: string;
}

export function SubjectSelector({ subjectSlug }: SubjectSelectorProps) {
  const router = useRouter();
  const subjects = useQuery(api.subjects.list, {});
  const selectId = `subject-selector-${subjectSlug}`;
  const subjectItems =
    subjects?.map((subject) => ({
      label: subject.name,
      value: subject.slug,
    })) ?? [];

  return (
    <Select
      aria-label="Select subject"
      disabled={!subjects || subjects.length === 0}
      id={selectId}
      items={subjectItems}
      onValueChange={(value) => {
        if (!value || value === subjectSlug) {
          return;
        }
        router.push(`/${value}`);
      }}
      value={subjectSlug}
    >
      <SelectTrigger id={selectId}>
        <BookOpenIcon aria-hidden="true" />
        <SelectValue placeholder="Select subject" />
      </SelectTrigger>
      <SelectPopup alignItemWithTrigger={false}>
        {subjectItems.map(({ label, value }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  );
}
