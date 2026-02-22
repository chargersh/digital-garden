"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { BookPlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface CreateLessonButtonProps {
  ariaLabel: string;
  groupId: Id<"lessonGroups">;
  parentNodeId?: Id<"lessonNodes"> | null;
  subjectId: Id<"subjects">;
}

export function CreateLessonButton({
  ariaLabel,
  groupId,
  parentNodeId = null,
  subjectId,
}: CreateLessonButtonProps) {
  const createNode = useMutation(api.lessonNodes.createGroupChild);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (isCreating) {
      return;
    }

    setIsCreating(true);
    try {
      await createNode({
        groupId,
        kind: "lesson",
        parentNodeId,
        status: "draft",
        subjectId,
        title: "New Lesson",
        uid: crypto.randomUUID(),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not create lesson.";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      aria-label={ariaLabel}
      disabled={isCreating}
      onClick={handleCreate}
      size="icon-xs"
      type="button"
      variant="ghost"
    >
      {isCreating ? <Spinner /> : <BookPlusIcon aria-hidden="true" />}
    </Button>
  );
}
