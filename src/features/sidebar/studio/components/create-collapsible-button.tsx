import type { Id } from "@convex/_generated/dataModel";
import { FolderPlusIcon } from "lucide-react";
import { CreateLessonNodeDialog } from "./create-lesson-node-dialog";

interface CreateCollapsibleButtonProps {
  ariaLabel: string;
  groupId: Id<"lessonGroups">;
  parentNodeId?: Id<"lessonNodes"> | null;
  parentTitle: string;
  subjectId: Id<"subjects">;
}

export function CreateCollapsibleButton({
  ariaLabel,
  parentTitle,
  groupId,
  parentNodeId = null,
  subjectId,
}: CreateCollapsibleButtonProps) {
  return (
    <CreateLessonNodeDialog
      ariaLabel={ariaLabel}
      description={`Create a section in "${parentTitle}" to organize nested lessons and subsections.`}
      errorMessage="Could not create section."
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
