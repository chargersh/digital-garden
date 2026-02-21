import type { Doc, Id } from "../_generated/dataModel";
import type { DatabaseReader, DatabaseWriter } from "../_generated/server";
import { slugifyValue } from "./common";

type LessonNodeDoc = Doc<"lessonNodes">;
type LessonNodeResult = Omit<LessonNodeDoc, "_creationTime">;

export interface SidebarLessonNode {
  id: Id<"lessonNodes">;
  items?: SidebarLessonNode[];
  kind: LessonNodeDoc["kind"];
  slug: string;
  status: LessonNodeDoc["status"];
  title: string;
  uid: string;
}

export const buildDefaultLessonDescription = (title: string): string =>
  `Notes for ${title}.`;

export const buildDefaultLessonBody = (title: string): string =>
  `# ${title}\n\nStart writing here.`;

export const toNodeResult = (
  node: LessonNodeDoc,
  overrides?: Partial<LessonNodeResult>
): LessonNodeResult => ({
  _id: node._id,
  uid: node.uid,
  subjectId: node.subjectId,
  groupId: node.groupId,
  parentNodeId: node.parentNodeId,
  kind: node.kind,
  title: node.title,
  slug: node.slug,
  order: node.order,
  status: node.status,
  updatedAt: node.updatedAt,
  ...overrides,
});

export const resolveNodeStatus = (
  kind: LessonNodeDoc["kind"],
  requestedStatus: LessonNodeDoc["status"] | undefined
): LessonNodeDoc["status"] => {
  if (kind === "collapsible") {
    if (requestedStatus !== undefined && requestedStatus !== null) {
      throw new Error("Collapsible nodes must have status null.");
    }
    return null;
  }

  if (requestedStatus === null) {
    throw new Error("Lesson nodes must have a non-null status.");
  }

  return requestedStatus ?? "draft";
};

export const getLessonNodeOrThrow = async (
  db: DatabaseReader,
  nodeId: Id<"lessonNodes">
) => {
  const node = await db.get(nodeId);
  if (!node) {
    throw new Error(`Lesson node "${nodeId}" was not found.`);
  }
  return node;
};

export const getLessonGroupOrThrow = async (
  db: DatabaseReader,
  groupId: Id<"lessonGroups">
) => {
  const group = await db.get(groupId);
  if (!group) {
    throw new Error(`Lesson group "${groupId}" was not found.`);
  }
  return group;
};

export const assertUniqueLessonNodeUid = async (
  db: DatabaseReader,
  subjectId: Id<"subjects">,
  uid: string,
  excludeId?: Id<"lessonNodes">
) => {
  const existing = await db
    .query("lessonNodes")
    .withIndex("by_subjectId_and_uid", (q) =>
      q.eq("subjectId", subjectId).eq("uid", uid)
    )
    .unique();

  if (existing && existing._id !== excludeId) {
    throw new Error(`Lesson node uid "${uid}" is already in use.`);
  }
};

export const buildUniqueSiblingSlug = async (
  db: DatabaseReader,
  subjectId: Id<"subjects">,
  parentNodeId: Id<"lessonNodes"> | null,
  titleOrSlug: string,
  excludeId?: Id<"lessonNodes">
) => {
  const baseSlug = slugifyValue(titleOrSlug);
  let attempt = 0;
  const MAX_SLUG_ATTEMPTS = 100;

  while (true) {
    if (attempt >= MAX_SLUG_ATTEMPTS) {
      throw new Error(
        `Could not generate a unique slug for "${baseSlug}" after ${MAX_SLUG_ATTEMPTS} attempts.`
      );
    }

    const suffix = attempt === 0 ? "" : `-${attempt + 1}`;
    const candidate = `${baseSlug}${suffix}`;
    const existing = await db
      .query("lessonNodes")
      .withIndex("by_subjectId_and_parentNodeId_and_slug", (q) =>
        q
          .eq("subjectId", subjectId)
          .eq("parentNodeId", parentNodeId)
          .eq("slug", candidate)
      )
      .unique();

    if (!existing || existing._id === excludeId) {
      return candidate;
    }

    attempt += 1;
  }
};

export const getNextLessonNodeOrder = async (
  db: DatabaseReader,
  subjectId: Id<"subjects">,
  groupId: Id<"lessonGroups">,
  parentNodeId: Id<"lessonNodes"> | null
) => {
  const highest = await db
    .query("lessonNodes")
    .withIndex("by_subjectId_and_groupId_and_parentNodeId_and_order", (q) =>
      q
        .eq("subjectId", subjectId)
        .eq("groupId", groupId)
        .eq("parentNodeId", parentNodeId)
    )
    .order("desc")
    .first();

  if (!highest) {
    return 0;
  }

  return highest.order + 1;
};

export const assertParentNodeForChild = async (
  db: DatabaseReader,
  subjectId: Id<"subjects">,
  groupId: Id<"lessonGroups">,
  parentNodeId: Id<"lessonNodes"> | null
) => {
  if (!parentNodeId) {
    return null;
  }

  const parent = await getLessonNodeOrThrow(db, parentNodeId);
  if (parent.subjectId !== subjectId) {
    throw new Error("Parent node must belong to the same subject.");
  }
  if (parent.groupId !== groupId) {
    throw new Error("Parent node must belong to the same group.");
  }
  if (parent.kind !== "collapsible") {
    throw new Error("Only collapsible nodes can have children.");
  }

  return parent;
};

export const assertNoNodeCycle = async (
  db: DatabaseReader,
  nodeId: Id<"lessonNodes">,
  parentNodeId: Id<"lessonNodes"> | null
) => {
  const MAX_ANCESTOR_DEPTH = 150;
  let cursor = parentNodeId;
  let depth = 0;

  while (cursor) {
    depth += 1;
    if (depth > MAX_ANCESTOR_DEPTH) {
      throw new Error(
        "Cycle detection exceeded max depth; possible existing cycle."
      );
    }

    if (cursor === nodeId) {
      throw new Error("Cannot move a node under its own subtree.");
    }

    const parent = await db.get(cursor);
    if (!parent) {
      throw new Error(`Parent node "${cursor}" was not found.`);
    }

    cursor = parent.parentNodeId;
  }
};

const byOrder = (a: LessonNodeDoc, b: LessonNodeDoc) =>
  a.order === b.order ? a.title.localeCompare(b.title) : a.order - b.order;

export const buildSidebarTree = async (
  db: DatabaseReader,
  subjectId: Id<"subjects">,
  includeUnpublished: boolean,
  includeEmptyCollapsibles: boolean
): Promise<{
  groups: Array<Doc<"lessonGroups"> & { items: SidebarLessonNode[] }>;
}> => {
  // This loads all nodes for the subject to build a fully ordered in-memory tree.
  // If subjects grow very large, consider pagination/lazy loading by group.
  const [groups, nodes] = await Promise.all([
    db
      .query("lessonGroups")
      .withIndex("by_subjectId_and_order", (q) => q.eq("subjectId", subjectId))
      .collect(),
    db
      .query("lessonNodes")
      .withIndex("by_subjectId_and_uid", (q) => q.eq("subjectId", subjectId))
      .collect(),
  ]);

  const byId = new Map(nodes.map((node) => [node._id, node] as const));
  const children = new Map<Id<"lessonNodes">, LessonNodeDoc[]>();
  const rootsByGroup = new Map<Id<"lessonGroups">, LessonNodeDoc[]>();

  for (const node of nodes) {
    if (node.parentNodeId) {
      const parent = byId.get(node.parentNodeId);
      if (!parent) {
        continue;
      }
      const bucket = children.get(node.parentNodeId) ?? [];
      bucket.push(node);
      children.set(node.parentNodeId, bucket);
      continue;
    }

    const roots = rootsByGroup.get(node.groupId) ?? [];
    roots.push(node);
    rootsByGroup.set(node.groupId, roots);
  }

  for (const bucket of children.values()) {
    bucket.sort(byOrder);
  }
  for (const bucket of rootsByGroup.values()) {
    bucket.sort(byOrder);
  }

  const buildVisibleNode = (
    nodeId: Id<"lessonNodes">
  ): SidebarLessonNode | null => {
    const node = byId.get(nodeId);
    if (!node) {
      return null;
    }

    const nested = (children.get(nodeId) ?? [])
      .map((child) => buildVisibleNode(child._id))
      .filter((item): item is SidebarLessonNode => item !== null);

    if (node.kind === "lesson") {
      if (!includeUnpublished && node.status !== "published") {
        return null;
      }
      return {
        id: node._id,
        uid: node.uid,
        kind: node.kind,
        title: node.title,
        slug: node.slug,
        status: node.status,
      };
    }

    if (
      !(includeUnpublished || includeEmptyCollapsibles) &&
      nested.length === 0
    ) {
      return null;
    }

    return {
      id: node._id,
      uid: node.uid,
      kind: node.kind,
      title: node.title,
      slug: node.slug,
      status: node.status,
      ...(nested.length > 0 ? { items: nested } : {}),
    };
  };

  return {
    groups: groups.map((group) => ({
      ...group,
      items: (rootsByGroup.get(group._id) ?? [])
        .map((node) => buildVisibleNode(node._id))
        .filter((item): item is SidebarLessonNode => item !== null),
    })),
  };
};

export const reindexSiblingOrders = async (
  db: DatabaseReader & DatabaseWriter,
  subjectId: Id<"subjects">,
  groupId: Id<"lessonGroups">,
  parentNodeId: Id<"lessonNodes"> | null
) => {
  const siblings = await db
    .query("lessonNodes")
    .withIndex("by_subjectId_and_groupId_and_parentNodeId_and_order", (q) =>
      q
        .eq("subjectId", subjectId)
        .eq("groupId", groupId)
        .eq("parentNodeId", parentNodeId)
    )
    .collect();

  siblings.sort(byOrder);

  for (const [index, sibling] of siblings.entries()) {
    if (sibling.order === index) {
      continue;
    }
    await db.patch(sibling._id, { order: index });
  }
};

export const reassignSubtreeGroup = async (
  db: DatabaseReader & DatabaseWriter,
  subjectId: Id<"subjects">,
  fromGroupId: Id<"lessonGroups">,
  toGroupId: Id<"lessonGroups">,
  rootNodeId: Id<"lessonNodes">,
  updatedAt: number
) => {
  // Caller patches the root first; this helper updates descendants only.
  const queue: Id<"lessonNodes">[] = [rootNodeId];
  const descendantIds: Id<"lessonNodes">[] = [];
  let queueIndex = 0;

  while (queueIndex < queue.length) {
    const current = queue[queueIndex];
    queueIndex += 1;

    const directChildren = await db
      .query("lessonNodes")
      .withIndex("by_subjectId_and_groupId_and_parentNodeId_and_order", (q) =>
        q
          .eq("subjectId", subjectId)
          .eq("groupId", fromGroupId)
          .eq("parentNodeId", current)
      )
      .collect();

    for (const child of directChildren) {
      descendantIds.push(child._id);
      queue.push(child._id);
    }
  }

  for (const descendantId of descendantIds) {
    await db.patch(descendantId, {
      groupId: toGroupId,
      updatedAt,
    });
  }
};

export const collectSubtreeNodes = async (
  db: DatabaseReader,
  subjectId: Id<"subjects">,
  groupId: Id<"lessonGroups">,
  rootNodeId: Id<"lessonNodes">
) => {
  const root = await getLessonNodeOrThrow(db, rootNodeId);
  const queue: Id<"lessonNodes">[] = [rootNodeId];
  const result: LessonNodeDoc[] = [root];
  let queueIndex = 0;

  while (queueIndex < queue.length) {
    const current = queue[queueIndex];
    queueIndex += 1;

    const directChildren = await db
      .query("lessonNodes")
      .withIndex("by_subjectId_and_groupId_and_parentNodeId_and_order", (q) =>
        q
          .eq("subjectId", subjectId)
          .eq("groupId", groupId)
          .eq("parentNodeId", current)
      )
      .collect();

    for (const child of directChildren) {
      result.push(child);
      queue.push(child._id);
    }
  }

  return result;
};

export const deleteSubtree = async (
  db: DatabaseReader & DatabaseWriter,
  rootNodeId: Id<"lessonNodes">
): Promise<Id<"lessonNodes">[]> => {
  const root = await getLessonNodeOrThrow(db, rootNodeId);
  const subtree = await collectSubtreeNodes(
    db,
    root.subjectId,
    root.groupId,
    rootNodeId
  );

  for (const node of subtree) {
    if (node.kind !== "lesson") {
      continue;
    }
    const content = await db
      .query("lessonContent")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", node._id))
      .unique();
    if (content) {
      // Keep deletes explicit and transactional per document in this mutation.
      // If subtree sizes grow large, consider chunked/background cleanup.
      await db.delete(content._id);
    }
  }

  for (let index = subtree.length - 1; index >= 0; index -= 1) {
    await db.delete(subtree[index]._id);
  }

  return subtree.map((node) => node._id);
};
