import type { Id } from "@convex/_generated/dataModel";
import { BookPlusIcon } from "lucide-react";
import { CreateLessonNodeDialog } from "./create-lesson-node-dialog";

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
  return (
    <CreateLessonNodeDialog
      ariaLabel={ariaLabel}
      description="Add a lesson as draft now, then edit and publish when ready."
      errorMessage="Could not create lesson."
      groupId={groupId}
      kind="lesson"
      parentNodeId={parentNodeId}
      placeholder="Lesson name"
      subjectId={subjectId}
      submitLabel="Create"
      title="New Lesson"
      triggerIcon={<BookPlusIcon aria-hidden="true" />}
    />
  );
}
