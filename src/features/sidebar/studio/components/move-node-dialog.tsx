"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { BookOpenIcon, ChevronRight, FolderIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useSubjectSidebar } from "@/features/sidebar/shared/subject-sidebar-context";
import type {
  LessonGroup,
  LessonNode,
  LessonNodeKind,
} from "@/features/sidebar/shared/types";
import { flattenChildItems } from "./node-preview-utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MoveNodeDialogProps {
  groupId: Id<"lessonGroups">;
  nodeId: Id<"lessonNodes">;
  nodeKind: LessonNodeKind;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
}

interface PathSegment {
  id: string;
  label: string;
  type: "collapsible" | "group";
}

interface CollapsibleOption {
  nodeId: Id<"lessonNodes">;
  title: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build the current path segments for the node being moved.
 * Walks the tree to find the node and returns the trail of group + collapsible
 * ancestors.
 */
const buildCurrentPath = (
  groups: LessonGroup[],
  groupId: Id<"lessonGroups">,
  nodeId: Id<"lessonNodes">
): PathSegment[] => {
  const group = groups.find((g) => g.groupId === groupId);
  if (!group) {
    return [];
  }

  const segments: PathSegment[] = [
    { id: group.groupId, label: group.title, type: "group" },
  ];

  const walkItems = (items: LessonNode[]): boolean => {
    for (const item of items) {
      if (item.nodeId === nodeId) {
        return true;
      }
      if (item.items && item.items.length > 0) {
        segments.push({
          id: item.nodeId,
          label: item.title,
          type: "collapsible",
        });
        if (walkItems(item.items)) {
          return true;
        }
        segments.pop();
      }
    }
    return false;
  };

  walkItems(group.items);
  return segments;
};

const buildCurrentParentPathIds = (
  groups: LessonGroup[],
  groupId: Id<"lessonGroups">,
  nodeId: Id<"lessonNodes">
): Id<"lessonNodes">[] => {
  const group = groups.find((candidate) => candidate.groupId === groupId);
  if (!group) {
    return [];
  }

  const parentPathIds: Id<"lessonNodes">[] = [];

  const walkItems = (items: LessonNode[]): boolean => {
    for (const item of items) {
      if (item.nodeId === nodeId) {
        return true;
      }
      if (item.kind === "collapsible" && item.items?.length) {
        parentPathIds.push(item.nodeId);
        if (walkItems(item.items)) {
          return true;
        }
        parentPathIds.pop();
      }
    }
    return false;
  };

  walkItems(group.items);
  return parentPathIds;
};

/**
 * Collect all collapsible nodes at the top level of the given items array,
 * excluding a specific node (the node being moved).
 */
const collectCollapsibles = (
  items: LessonNode[],
  excludeNodeId: Id<"lessonNodes">
): CollapsibleOption[] => {
  const result: CollapsibleOption[] = [];
  for (const item of items) {
    if (item.nodeId === excludeNodeId) {
      continue;
    }
    if (item.kind === "collapsible") {
      result.push({ nodeId: item.nodeId, title: item.title });
    }
  }
  return result;
};

/**
 * Recursively find the children of a specific collapsible node in the tree.
 */
const findNodeChildren = (
  items: LessonNode[],
  targetNodeId: Id<"lessonNodes">
): LessonNode[] | null => {
  for (const item of items) {
    if (item.nodeId === targetNodeId) {
      return item.items ?? [];
    }
    if (item.items) {
      const found = findNodeChildren(item.items, targetNodeId);
      if (found !== null) {
        return found;
      }
    }
  }
  return null;
};

/**
 * Look up a node's title by ID, searching the full tree.
 */
const findNodeTitle = (
  items: LessonNode[],
  targetNodeId: Id<"lessonNodes">
): string | null => {
  for (const item of items) {
    if (item.nodeId === targetNodeId) {
      return item.title;
    }
    if (item.items) {
      const found = findNodeTitle(item.items, targetNodeId);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

/**
 * Find a node in the tree by ID and recursively flatten all of its descendants
 * into a flat list with depth information for display purposes.
 */
const collectNestedItems = (
  groups: LessonGroup[],
  groupId: Id<"lessonGroups">,
  nodeId: Id<"lessonNodes">
): ReturnType<typeof flattenChildItems> => {
  const group = groups.find((g) => g.groupId === groupId);
  if (!group) {
    return [];
  }

  const findNode = (items: LessonNode[]): LessonNode | null => {
    for (const item of items) {
      if (item.nodeId === nodeId) {
        return item;
      }
      if (item.items) {
        const found = findNode(item.items);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  const node = findNode(group.items);
  if (!node?.items?.length) {
    return [];
  }

  return flattenChildItems(node.items);
};

// Group root sentinel — represents placing the node at the group root (no
// parent collapsible).
const GROUP_ROOT_VALUE = "__group_root__";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MoveNodeDialog({
  groupId: sourceGroupId,
  nodeId,
  nodeKind,
  onOpenChange,
  open,
  title,
}: MoveNodeDialogProps) {
  const moveNode = useMutation(api.lessonNodes.move);
  const { lessonGroups } = useSubjectSidebar();

  const [targetGroupId, setTargetGroupId] =
    useState<Id<"lessonGroups">>(sourceGroupId);
  const [selectedParentPath, setSelectedParentPath] = useState<
    Id<"lessonNodes">[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleContextMenuCapture = (event: MouseEvent) => {
      event.stopPropagation();
    };

    document.addEventListener("contextmenu", handleContextMenuCapture, true);

    return () => {
      document.removeEventListener(
        "contextmenu",
        handleContextMenuCapture,
        true
      );
    };
  }, [open]);

  // ---- Derived data -------------------------------------------------------

  const groupItems = useMemo(
    () =>
      lessonGroups.map((group) => ({
        label:
          group.groupId === sourceGroupId
            ? `${group.title} (Current)`
            : group.title,
        value: group.groupId,
      })),
    [lessonGroups, sourceGroupId]
  );

  const currentPath = useMemo(
    () => buildCurrentPath(lessonGroups, sourceGroupId, nodeId),
    [lessonGroups, sourceGroupId, nodeId]
  );
  const currentParentPathIds = useMemo(
    () => buildCurrentParentPathIds(lessonGroups, sourceGroupId, nodeId),
    [lessonGroups, sourceGroupId, nodeId]
  );

  const targetGroup = useMemo(
    () => lessonGroups.find((g) => g.groupId === targetGroupId) ?? null,
    [lessonGroups, targetGroupId]
  );

  /**
   * Build cascading collapsible options for each nesting level.
   * Level 0: collapsibles at the group root.
   * Level N: collapsibles inside the collapsible selected at level N-1.
   */
  const cascadingLevels = useMemo(() => {
    if (!targetGroup) {
      return [];
    }

    const levels: CollapsibleOption[][] = [];

    // Level 0 — group root collapsibles
    const rootCollapsibles = collectCollapsibles(targetGroup.items, nodeId);
    if (rootCollapsibles.length === 0) {
      return levels;
    }
    levels.push(rootCollapsibles);

    // Subsequent levels based on selections
    for (const parentId of selectedParentPath) {
      const children = findNodeChildren(targetGroup.items, parentId);
      if (!children) {
        break;
      }

      const childCollapsibles = collectCollapsibles(children, nodeId);
      if (childCollapsibles.length === 0) {
        break;
      }
      levels.push(childCollapsibles);
    }

    return levels;
  }, [targetGroup, selectedParentPath, nodeId]);

  /**
   * The effective target parentNodeId derived from the deepest selection.
   * If no collapsible is selected, the node moves to the group root.
   */
  const effectiveParentNodeId: Id<"lessonNodes"> | null =
    selectedParentPath.at(-1) ?? null;

  /**
   * Build the new path segments for the preview.
   */
  const newPath = useMemo<PathSegment[]>(() => {
    if (!targetGroup) {
      return [];
    }

    const segments: PathSegment[] = [
      { id: targetGroup.groupId, label: targetGroup.title, type: "group" },
    ];

    for (const parentId of selectedParentPath) {
      const parentTitle = findNodeTitle(targetGroup.items, parentId);
      if (parentTitle) {
        segments.push({
          id: parentId,
          label: parentTitle,
          type: "collapsible",
        });
      }
    }

    return segments;
  }, [targetGroup, selectedParentPath]);

  /**
   * For collapsible nodes, collect all nested descendants to show in the
   * "will also move" accordion.
   */
  const nestedItems = useMemo(
    () =>
      nodeKind === "collapsible"
        ? collectNestedItems(lessonGroups, sourceGroupId, nodeId)
        : [],
    [nodeKind, lessonGroups, sourceGroupId, nodeId]
  );
  const previewItems = nestedItems.slice(0, 20);
  const remainingCount = nestedItems.length - previewItems.length;

  // ---- Handlers -----------------------------------------------------------

  const handleGroupChange = useCallback((value: string | null) => {
    if (!value) {
      return;
    }
    setTargetGroupId(value as Id<"lessonGroups">);
    setSelectedParentPath([]);
  }, []);

  const handleCollapsibleChange = useCallback(
    (levelIndex: number, value: string | null) => {
      if (!value) {
        return;
      }

      if (value === GROUP_ROOT_VALUE) {
        setSelectedParentPath((prev) => prev.slice(0, levelIndex));
        return;
      }

      const collapsibleId = value as Id<"lessonNodes">;
      setSelectedParentPath((prev) => {
        const next = prev.slice(0, levelIndex);
        next.push(collapsibleId);
        return next;
      });
    },
    []
  );

  const isMoveDisabled = useMemo(() => {
    if (targetGroupId !== sourceGroupId) {
      return false;
    }

    return (
      currentParentPathIds.length === selectedParentPath.length &&
      currentParentPathIds.every(
        (parentNodeId, index) => parentNodeId === selectedParentPath[index]
      )
    );
  }, [targetGroupId, sourceGroupId, currentParentPathIds, selectedParentPath]);

  const handleMove = async () => {
    if (isSubmitting || isMoveDisabled) {
      return;
    }

    setIsSubmitting(true);
    try {
      await moveNode({
        nodeId,
        targetGroupId,
        targetParentNodeId: effectiveParentNodeId,
      });
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not move node.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setTargetGroupId(sourceGroupId);
      setSelectedParentPath([]);
    }
  };

  const nodeLabel = nodeKind === "collapsible" ? "section" : "lesson";

  // ---- Render -------------------------------------------------------------

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent finalFocus={false}>
        <DialogHeader>
          <DialogTitle>{`Move ${nodeLabel}`}</DialogTitle>
          <DialogDescription>
            {`Pick a new location for "${title}".`}
          </DialogDescription>
        </DialogHeader>

        <DialogPanel scrollFade={false}>
          <div className="space-y-5">
            {/* Current path */}
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">
                Current location
              </Label>
              <PathBreadcrumb segments={currentPath} title={title} />
            </div>

            {/* Group selector */}
            <div className="space-y-1.5">
              <Label className="text-xs">Group</Label>
              <Select
                items={groupItems}
                onValueChange={handleGroupChange}
                value={targetGroupId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectPopup alignItemWithTrigger={false}>
                  {groupItems.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </div>

            {/* Cascading collapsible selectors */}
            {cascadingLevels.map((options, levelIndex) => {
              const levelKey =
                levelIndex === 0
                  ? "level-root"
                  : `level-${selectedParentPath[levelIndex - 1]}`;
              const collapsibleItems = [
                {
                  label:
                    levelIndex === 0
                      ? "None — place at top level"
                      : "None — keep here",
                  value: GROUP_ROOT_VALUE,
                },
                ...options.map((option) => ({
                  label: option.title,
                  value: option.nodeId,
                })),
              ];
              return (
                <div className="space-y-1.5" key={levelKey}>
                  <Label className="text-xs">
                    {levelIndex === 0 ? "Section" : "Subsection"}
                  </Label>
                  <Select
                    items={collapsibleItems}
                    onValueChange={(value) =>
                      handleCollapsibleChange(levelIndex, value)
                    }
                    value={selectedParentPath[levelIndex] ?? GROUP_ROOT_VALUE}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectPopup alignItemWithTrigger={false}>
                      {collapsibleItems.map(({ label, value }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                </div>
              );
            })}

            {/* New path */}
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">
                New location
              </Label>
              <PathBreadcrumb segments={newPath} title={title} />
            </div>

            {/* Nested items accordion */}
            {nestedItems.length > 0 && (
              <Accordion className="w-full">
                <AccordionItem className="border-0" value="nested-items">
                  <AccordionTrigger className="min-h-9 items-center rounded-lg border border-border/60 bg-muted/20 px-[calc(--spacing(3)-1px)] py-1.5 text-muted-foreground text-sm leading-normal transition-colors hover:bg-muted/35 **:data-[slot=accordion-indicator]:translate-y-0 sm:min-h-8">
                    {`Will also move ${nestedItems.length} nested ${nestedItems.length === 1 ? "item" : "items"}`}
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
            )}
          </div>
        </DialogPanel>

        <DialogFooter className="sm:justify-between" variant="bare">
          <Button
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={isSubmitting || isMoveDisabled}
            onClick={handleMove}
            type="button"
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Moving...
              </>
            ) : (
              "Move"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// PathBreadcrumb — inline breadcrumb for current / new path display
// ---------------------------------------------------------------------------

function PathBreadcrumb({
  segments,
  title,
}: {
  segments: PathSegment[];
  title: string;
}) {
  return (
    <div className="custom-scrollbar flex min-h-9 items-center gap-1 overflow-x-auto whitespace-nowrap rounded-lg border border-border/60 bg-muted/20 px-[calc(--spacing(3)-1px)] py-1.5 text-sm sm:min-h-8">
      {segments.map((segment) => (
        <span className="flex items-center gap-1" key={segment.id}>
          {segment.type === "collapsible" && (
            <ChevronRight
              aria-hidden="true"
              className="size-3 shrink-0 text-muted-foreground"
            />
          )}
          <span className="text-muted-foreground">{segment.label}</span>
        </span>
      ))}
      {segments.length > 0 && (
        <ChevronRight
          aria-hidden="true"
          className="size-3 shrink-0 text-muted-foreground"
        />
      )}
      <span className="font-medium">{title}</span>
    </div>
  );
}
