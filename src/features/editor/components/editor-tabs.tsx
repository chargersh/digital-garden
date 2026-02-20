"use client";

import { TabsList, TabsTab } from "@/components/ui/tabs";

export type EditorTabValue = "markdown" | "preview";

export const EDITOR_TAB_MARKDOWN_ID = "editor-tab-markdown";
export const EDITOR_TAB_PREVIEW_ID = "editor-tab-preview";
export const EDITOR_PANEL_MARKDOWN_ID = "editor-panel-markdown";
export const EDITOR_PANEL_PREVIEW_ID = "editor-panel-preview";

export function EditorTabs() {
  return (
    <TabsList>
      <TabsTab
        aria-controls={EDITOR_PANEL_MARKDOWN_ID}
        id={EDITOR_TAB_MARKDOWN_ID}
        value="markdown"
      >
        Markdown
      </TabsTab>
      <TabsTab
        aria-controls={EDITOR_PANEL_PREVIEW_ID}
        id={EDITOR_TAB_PREVIEW_ID}
        value="preview"
      >
        Preview
      </TabsTab>
    </TabsList>
  );
}
