"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { FolderPlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface CreateCollapsibleButtonProps {
  ariaLabel: string;
  groupId: Id<"lessonGroups">;
  parentNodeId?: Id<"lessonNodes"> | null;
  subjectId: Id<"subjects">;
}

export function CreateCollapsibleButton({
  ariaLabel,
  groupId,
  parentNodeId = null,
  subjectId,
}: CreateCollapsibleButtonProps) {
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
        kind: "collapsible",
        parentNodeId,
        subjectId,
        title: "New Collapsible",
        uid: crypto.randomUUID(),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not create collapsible.";
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
      {isCreating ? <Spinner /> : <FolderPlusIcon aria-hidden="true" />}
    </Button>
  );
}
