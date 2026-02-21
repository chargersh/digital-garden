"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { PlusIcon } from "lucide-react";
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

interface CreateLessonGroupDialogProps {
  subjectId: Id<"subjects">;
}

export function CreateLessonGroupDialog({
  subjectId,
}: CreateLessonGroupDialogProps) {
  const createLessonGroup = useMutation(api.lessonGroups.create);
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trimmedName = groupName.trim();
  const isNameValid = trimmedName.length >= 5;

  const reset = () => {
    setGroupName("");
    setIsSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset();
    }
  };

  const handleCreate = async () => {
    if (isSubmitting) {
      return;
    }

    if (!isNameValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createLessonGroup({
        isDefault: false,
        subjectId,
        title: trimmedName,
      });
      setOpen(false);
      reset();
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Could not create lesson group.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger
        aria-label="Create lesson group"
        render={<Button size="sm" variant="outline" />}
      >
        <PlusIcon aria-hidden="true" />
        New Lesson Group
      </DialogTrigger>

      <DialogContent>
        <DialogHeader className="pb-2">
          <DialogTitle>Create Lesson Group</DialogTitle>
          <DialogDescription>
            Lesson groups are top-level folders in this subject.
          </DialogDescription>
        </DialogHeader>

        <DialogPanel className="space-y-1.5 pb-4" scrollFade={false}>
          <Input
            aria-label="Lesson group name"
            autoFocus
            onChange={(event) => setGroupName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleCreate();
              }
            }}
            placeholder="Group name"
            value={groupName}
          />
        </DialogPanel>

        <DialogFooter className="pt-0" variant="bare">
          <Button
            disabled={isSubmitting}
            onClick={() => setOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={isSubmitting || !isNameValid}
            onClick={handleCreate}
          >
            {isSubmitting ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
