import type { Id } from "@convex/_generated/dataModel";
import { BookPlusIcon } from "lucide-react";
import { CreateLessonNodeDialog } from "./create-lesson-node-dialog";

interface CreateLessonButtonProps {
  ariaLabel: string;
  groupId: Id<"lessonGroups">;
  parentNodeId?: Id<"lessonNodes"> | null;
  parentTitle: string;
  subjectId: Id<"subjects">;
}

export function CreateLessonButton({
  ariaLabel,
  parentTitle,
  groupId,
  parentNodeId = null,
  subjectId,
}: CreateLessonButtonProps) {
  return (
    <CreateLessonNodeDialog
      ariaLabel={ariaLabel}
      description={`Create a draft lesson in "${parentTitle}". You can edit and publish it later.`}
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
