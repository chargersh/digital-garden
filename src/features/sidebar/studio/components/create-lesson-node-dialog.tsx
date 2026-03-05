"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

interface CreateLessonNodeDialogProps {
  ariaLabel: string;
  description: string;
  errorMessage: string;
  groupId: Id<"lessonGroups">;
  kind: "collapsible" | "lesson";
  parentNodeId?: Id<"lessonNodes"> | null;
  placeholder: string;
  subjectId: Id<"subjects">;
  submitLabel: string;
  title: string;
  triggerIcon: ReactNode;
}

export function CreateLessonNodeDialog({
  ariaLabel,
  description,
  errorMessage,
  groupId,
  kind,
  parentNodeId = null,
  placeholder,
  subjectId,
  submitLabel,
  title,
  triggerIcon,
}: CreateLessonNodeDialogProps) {
  const createNode = useMutation(api.lessonNodes.createGroupChild);
  const [open, setOpen] = useState(false);
  const [nodeName, setNodeName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trimmedName = nodeName.trim();
  const isNameValid = trimmedName.length > 0;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setNodeName("");
    }
  };

  const handleCreate = async () => {
    if (isSubmitting || !isNameValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createNode({
        groupId,
        kind,
        parentNodeId,
        status: kind === "lesson" ? "draft" : undefined,
        subjectId,
        title: trimmedName,
        uid: crypto.randomUUID(),
      });
      setOpen(false);
      setNodeName("");
    } catch (error) {
      const message = error instanceof Error ? error.message : errorMessage;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger
        aria-label={ariaLabel}
        id={`create-${kind}-trigger-${groupId}-${parentNodeId ?? "root"}`}
        render={<Button size="icon-xs" type="button" variant="ghost" />}
      >
        {triggerIcon}
      </DialogTrigger>

      <DialogContent finalFocus={false}>
        <DialogHeader className="pb-2">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogPanel className="space-y-1.5 pb-4" scrollFade={false}>
          <Input
            aria-label={placeholder}
            autoFocus
            onChange={(event) => setNodeName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleCreate();
              }
            }}
            placeholder={placeholder}
            value={nodeName}
          />
        </DialogPanel>

        <DialogFooter className="pt-0 sm:justify-between" variant="bare">
          <Button
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={isSubmitting || !isNameValid}
            onClick={handleCreate}
            type="button"
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Creating...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
