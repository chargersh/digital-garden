"use client";

import type { Id } from "@convex/_generated/dataModel";
import { FolderInput } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { LessonNodeKind } from "@/features/sidebar/shared/types";
import { MoveNodeDialog } from "./move-node-dialog";

interface NodeContextMenuProps {
  children: ReactNode;
  groupId: Id<"lessonGroups">;
  nodeId: Id<"lessonNodes">;
  nodeKind: LessonNodeKind;
  title: string;
}

export function NodeContextMenu({
  children,
  groupId,
  nodeId,
  nodeKind,
  title,
}: NodeContextMenuProps) {
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
        </ContextMenuContent>
      </ContextMenu>
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
