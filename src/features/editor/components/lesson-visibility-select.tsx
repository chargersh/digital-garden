"use client";

import {
  ArchiveIcon,
  FilePenLineIcon,
  GlobeIcon,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { icon: FilePenLineIcon, label: "Draft", value: "draft" },
  { icon: GlobeIcon, label: "Published", value: "published" },
  { icon: ArchiveIcon, label: "Archived", value: "archived" },
] as const;

interface LessonStatusOption {
  icon: LucideIcon;
  label: string;
  value: "archived" | "draft" | "published";
}

export function LessonVisibilitySelect() {
  const [status, setStatus] = useState<LessonStatusOption>(STATUS_OPTIONS[0]);

  return (
    <Select
      defaultValue={STATUS_OPTIONS[0]}
      id="lesson-status-select"
      itemToStringValue={(item) => item.value}
      onValueChange={(value) => {
        if (!value) {
          return;
        }
        setStatus(value as LessonStatusOption);
      }}
      value={status}
    >
      <SelectTrigger
        className="w-40 pl-2"
        id="lesson-status-select"
        size="default"
      >
        <SelectValue placeholder="Select status">
          {(item) => (
            <span className="flex items-center gap-2">
              <item.icon className="size-4" />
              <span className="truncate">{item.label}</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectPopup alignItemWithTrigger={false}>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem className="ps-1.5" key={option.value} value={option}>
            <span className="-ml-1 flex items-center gap-2">
              <option.icon className="size-4" />
              <span className="truncate">{option.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  );
}
