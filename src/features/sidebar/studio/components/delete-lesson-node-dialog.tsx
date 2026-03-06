"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { BookOpenIcon, FolderIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { LessonNode } from "@/features/sidebar/shared/types";
import { flattenChildItems } from "./node-preview-utils";

interface DeleteLessonNodeDialogProps {
  childItems?: LessonNode[];
  nodeId: Id<"lessonNodes">;
  nodeKind?: "collapsible" | "lesson";
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
}

export function DeleteLessonNodeDialog({
  childItems = [],
  nodeId,
  nodeKind = "lesson",
  onOpenChange,
  open,
  title,
}: DeleteLessonNodeDialogProps) {
  const removeNode = useMutation(api.lessonNodes.removeNode);
  const [isDeleting, setIsDeleting] = useState(false);
  const descendantItems =
    nodeKind === "collapsible" ? flattenChildItems(childItems) : [];
  const childCount = descendantItems.length;
  const previewItems = descendantItems.slice(0, 20);
  const remainingCount = childCount - previewItems.length;
  const nestedItemLabel = childCount === 1 ? "nested item" : "nested items";

  const nodeLabel = nodeKind === "collapsible" ? "section" : "lesson";
  const deleteLabel =
    nodeKind === "collapsible" ? "Delete Section" : "Delete Lesson";

  const handleDelete = async () => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      await removeNode({ nodeId });
      onOpenChange(false);
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
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogPopup>
        <AlertDialogHeader className="gap-3">
          <AlertDialogTitle>{`Delete ${nodeLabel}?`}</AlertDialogTitle>
          <AlertDialogDescription className="leading-relaxed">
            {nodeKind === "collapsible"
              ? `Are you sure you want to delete "${title}"? This will permanently delete this section. This action cannot be undone.`
              : `Are you sure you want to delete "${title}"? This action cannot be undone.`}
          </AlertDialogDescription>
          {nodeKind === "collapsible" && childCount > 0 ? (
            <Accordion className="w-full">
              <AccordionItem className="border-0" value="node-children">
                <AccordionTrigger className="min-h-9 items-center rounded-lg border border-border/60 bg-muted/20 px-[calc(--spacing(3)-1px)] py-1.5 text-muted-foreground text-sm leading-normal transition-colors hover:bg-muted/35 **:data-[slot=accordion-indicator]:translate-y-0 sm:min-h-8">
                  {`It will also delete ${childCount} ${nestedItemLabel}.`}
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-0">
                  <ul className="custom-scrollbar max-h-56 space-y-1.5 overflow-y-auto rounded-md border border-border/60 bg-muted/20 p-2.5 pr-2">
                    {previewItems.map((item) => (
                      <li
                        className="flex items-center gap-2 rounded-sm px-1.5 py-1 text-muted-foreground text-sm"
                        key={item.nodeId}
                        style={{ paddingLeft: `${item.depth * 12}px` }}
                        title={item.title}
                      >
                        {item.kind === "collapsible" ? (
                          <FolderIcon
                            aria-hidden="true"
                            className="size-3.5 shrink-0"
                          />
                        ) : (
                          <BookOpenIcon
                            aria-hidden="true"
                            className="size-3.5 shrink-0"
                          />
                        )}
                        <span className="truncate">{item.title}</span>
                      </li>
                    ))}
                    {remainingCount > 0 ? (
                      <li className="border-border/60 border-t px-1.5 pt-2 text-muted-foreground text-sm">
                        {`...and ${remainingCount} more`}
                      </li>
                    ) : null}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : null}
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
