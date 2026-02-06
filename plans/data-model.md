# Data Model Plan (Convex)

## Core Principle
Use app-level `uid` strings for all references in content and mentions, not Convex `_id`.
This enables optimistic UI and stable references inside MDX tags.

- `_id`: Convex document ID (server-generated)
- `uid`: app-generated, stable ID used in content and references

---

## Tables

### `lessons`
- `_id`
- `uid` (string, unique)
- `slug` (unique)
- `title`
- `content` (MDX string)
- `status` (`"draft" | "published"`)
- `mentionsHash` (string)
- `createdAt`, `updatedAt`

### `concepts`
- `_id`
- `uid` (string, unique)
- `slug` (unique)
- `title`
- `summary`
- `content`
- `status` (`"stub" | "draft" | "published"`)
- `appearsIn` (array of lesson `uid`s, cached)
- `createdAt`, `updatedAt`

### `people`
- `_id`
- `uid` (string, unique)
- `slug` (unique)
- `name`
- `summary`
- `bio`
- `photoUrl` (optional)
- `status` (`"stub" | "draft" | "published"`)
- `appearsIn` (array of lesson `uid`s, cached)
- `createdAt`, `updatedAt`

### `mentions`
- `_id`
- `sourceType` = `"lesson"`
- `sourceUid` (lesson `uid`)
- `targetType` = `"concept" | "person"`
- `targetUid` (concept/person `uid`)
- `createdAt`

Notes:
- No `token` stored; the display text remains in MDX.
- One row represents a single edge: lesson -> concept/person.

---

## MDX Tag Format

```mdx
<Concept id="c_abc123">derivative</Concept>
<Person id="p_8k2lm">Karl Marx</Person>
```

`id` is the app-level `uid`.

---

## Mentions Update Flow (Optimized)

On lesson save:
1. Extract all concept/person `uid`s from MDX.
2. Compute `mentionsHash` from sorted IDs.
3. If hash unchanged, skip all mention updates.
4. Else:
   - Load old mentions for the lesson.
   - Diff: `added = new - old`, `removed = old - new`.
   - Insert only `added` mentions.
   - Delete only `removed` mentions.
   - Update `appearsIn` arrays only for changed targets.

This avoids full rebuilds and skips work when only text changed.

---

## Queries Supported

- Lesson -> mentions:
  - `mentions` where `sourceUid = lessonUid`
- Concept/person -> lessons:
  - `mentions` where `targetUid = entityUid`

This gives bidirectional behavior from a single edge list.

---

## Graph View (Future)

Nodes = lessons + concepts + people
Edges = mentions

Subgraphs:
- Concept-centered (concept + lessons + nearby concepts)
- Lesson-centered (lesson + all mentioned entities)

No extra database required for visualization.
