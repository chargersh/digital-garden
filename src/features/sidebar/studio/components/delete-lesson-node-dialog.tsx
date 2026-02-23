"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface DeleteLessonNodeDialogProps {
  nodeId: Id<"lessonNodes">;
  nodeKind?: "collapsible" | "lesson";
  title: string;
}

export function DeleteLessonNodeDialog({
  nodeId,
  nodeKind = "lesson",
  title,
}: DeleteLessonNodeDialogProps) {
  const removeNode = useMutation(api.lessonNodes.removeNode);
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const nodeLabel = nodeKind === "collapsible" ? "collapsible" : "lesson";
  const deleteLabel =
    nodeKind === "collapsible" ? "Delete Collapsible" : "Delete Lesson";
  const description =
    nodeKind === "collapsible"
      ? `Are you sure you want to delete "${title}" and all nested lessons? This action cannot be undone.`
      : `Are you sure you want to delete "${title}"? This action cannot be undone.`;

  const handleDelete = async () => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      await removeNode({ nodeId });
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Could not delete ${nodeLabel}.`;
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger
        aria-label={`Delete ${title}`}
        render={<Button size="icon-xs" type="button" variant="ghost" />}
      >
        <Trash2Icon aria-hidden="true" />
      </AlertDialogTrigger>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>{`Delete ${nodeLabel}?`}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogClose
            disabled={isDeleting}
            render={<Button type="button" variant="outline" />}
          >
            Cancel
          </AlertDialogClose>
          <Button
            disabled={isDeleting}
            onClick={handleDelete}
            type="button"
            variant="destructive"
          >
            {isDeleting ? (
              <>
                <Spinner />
                Deleting...
              </>
            ) : (
              deleteLabel
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
