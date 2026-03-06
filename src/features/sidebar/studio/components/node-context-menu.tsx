"use client";

import type { Id } from "@convex/_generated/dataModel";
import { FolderInput, Trash2Icon } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type {
  LessonNode,
  LessonNodeKind,
} from "@/features/sidebar/shared/types";
import { DeleteLessonNodeDialog } from "./delete-lesson-node-dialog";
import { MoveNodeDialog } from "./move-node-dialog";

interface NodeContextMenuProps {
  childItems?: LessonNode[];
  children: ReactNode;
  groupId: Id<"lessonGroups">;
  nodeId: Id<"lessonNodes">;
  nodeKind: LessonNodeKind;
  title: string;
}

export function NodeContextMenu({
  childItems,
  children,
  groupId,
  nodeId,
  nodeKind,
  title,
}: NodeContextMenuProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => setIsMoveOpen(true)}>
            <FolderInput aria-hidden="true" />
            Move
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onSelect={() => setIsDeleteOpen(true)}
            variant="destructive"
          >
            <Trash2Icon aria-hidden="true" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {isDeleteOpen ? (
        <DeleteLessonNodeDialog
          childItems={childItems}
          nodeId={nodeId}
          nodeKind={nodeKind}
          onOpenChange={setIsDeleteOpen}
          open={isDeleteOpen}
          title={title}
        />
      ) : null}
      {isMoveOpen ? (
        <MoveNodeDialog
          groupId={groupId}
          nodeId={nodeId}
          nodeKind={nodeKind}
          onOpenChange={setIsMoveOpen}
          open={isMoveOpen}
          title={title}
        />
      ) : null}
    </>
  );
}
