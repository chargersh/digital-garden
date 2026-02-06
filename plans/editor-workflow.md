# Editor Workflow (Markdown + Tag Insertion)

## Core Principle
The editor is plain Markdown only. No live rendering while typing.
Toolbar actions insert visible MDX-style tags, so the author always sees the exact structure.

---

## Toolbar Buttons
- Concept
- Person

Each button opens a search input for the respective entity type.

---

## Selection -> Tag Insertion

### Behavior
1. Author highlights text in the Markdown editor.
2. Clicks Concept or Person toolbar button.
3. Search input opens and focuses.
4. As the user types, we query Convex search by name.
5. If a result is selected, wrap the selection with a tag:

```mdx
<Concept id="c_abc123">selected text</Concept>
<Person id="p_8k2lm">selected text</Person>
```

### Implementation Note (textarea)
In a plain `<textarea>`, browsers expose:
- `selectionStart`
- `selectionEnd`

We can replace the selected substring with the tag and restore the cursor position.

---

## No Result -> Stub Creation

If the search returns no results:
- Show a “Make stub” action.
- Pressing Enter also creates the stub (no extra click required).

Stub creation:
- Call a Convex mutation to create a stub entity.
- Receive its `uid`.
- Insert a tag with that `uid` around the selection.

---

## Stub Queue (Sidebar)

The UI includes a sidebar that have a section you can click where inside it, it lists all concepts/people.
- Stubbed entities are grouped in a “To write” section.
- When a stub is filled out and saved, it leaves the stub section.

---

## Hover / Tooltip for Stubs

When a stub is mentioned:
- Hover shows a message like “Not written yet”.
- Provide a link to open the stub for editing.

---

## Key UX Guarantees
- The author always sees real Markdown tags (no hidden structure).
- Tag insertion is immediate and visible.
- Stub creation is one keystroke (Enter) when no match exists.
