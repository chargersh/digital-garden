"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { BookOpenIcon, FolderIcon, Trash2Icon } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { LessonNode } from "@/features/sidebar/shared/types";
import { flattenChildItems } from "./delete-dialog-utils";

interface DeleteLessonGroupDialogProps {
  childItems: LessonNode[];
  groupId: Id<"lessonGroups">;
  title: string;
}

export function DeleteLessonGroupDialog({
  childItems,
  groupId,
  title,
}: DeleteLessonGroupDialogProps) {
  const removeGroup = useMutation(api.lessonGroups.remove);
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const descendantItems = flattenChildItems(childItems);
  const childCount = descendantItems.length;
  const previewItems = descendantItems.slice(0, 20);
  const remainingCount = childCount - previewItems.length;
  const nestedItemLabel = childCount === 1 ? "nested item" : "nested items";

  const handleDelete = async () => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      await removeGroup({ groupId });
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not delete lesson group.";
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
        <AlertDialogHeader className="gap-3">
          <AlertDialogTitle>Delete lesson group?</AlertDialogTitle>
          <AlertDialogDescription className="leading-relaxed">
            Are you sure you want to delete "{title}"? This will permanently
            delete this group. This action cannot be undone.
          </AlertDialogDescription>
          {childCount > 0 ? (
            <Accordion className="w-full">
              <AccordionItem className="border-0" value="group-children">
                <AccordionTrigger className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-muted-foreground text-sm leading-relaxed transition-colors hover:bg-muted/35">
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
              "Delete Group"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
