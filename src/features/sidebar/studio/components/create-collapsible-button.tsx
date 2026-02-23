import type { Id } from "@convex/_generated/dataModel";
import { FolderPlusIcon } from "lucide-react";
import { CreateLessonNodeDialog } from "./create-lesson-node-dialog";

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
  return (
    <CreateLessonNodeDialog
      ariaLabel={ariaLabel}
      description="Add a section that can contain nested lessons and subsections."
      errorMessage="Could not create collapsible."
      groupId={groupId}
      kind="collapsible"
      parentNodeId={parentNodeId}
      placeholder="Section name"
      subjectId={subjectId}
      submitLabel="Create"
      title="New Section"
      triggerIcon={<FolderPlusIcon aria-hidden="true" />}
    />
  );
}
