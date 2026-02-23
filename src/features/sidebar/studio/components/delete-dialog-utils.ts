import type { LessonNode } from "@/features/sidebar/shared/types";

interface DescendantPreviewItem {
  depth: number;
  kind: LessonNode["kind"];
  nodeId: LessonNode["nodeId"];
  title: string;
}

export const flattenChildItems = (
  nodes: LessonNode[],
  depth = 0
): DescendantPreviewItem[] => {
  return nodes.flatMap((node) => {
    const nested = node.items ? flattenChildItems(node.items, depth + 1) : [];

    return [
      {
        depth,
        kind: node.kind,
        nodeId: node.nodeId,
        title: node.title,
      },
      ...nested,
    ];
  });
};
