"use client";

import { useMemo, useRef, useState } from "react";
import { Tabs, TabsPanel } from "@/components/ui/tabs";
import { EditorHeader } from "@/features/editor/components/editor-header";
import {
  EDITOR_PANEL_MARKDOWN_ID,
  EDITOR_PANEL_PREVIEW_ID,
  EDITOR_TAB_MARKDOWN_ID,
  EDITOR_TAB_PREVIEW_ID,
  type EditorTabValue,
} from "@/features/editor/components/editor-tabs";
import { MarkdownEditorPane } from "@/features/editor/components/markdown-editor-pane";
import { PreviewPane } from "@/features/editor/components/preview-pane";
import {
  INLINE_TOKENS,
  useMarkdownFormatting,
} from "@/features/editor/hooks/use-markdown-formatting";
import { useMdxPreview } from "@/features/editor/hooks/use-mdx-preview";
import { getMDXComponents } from "@/features/mdx/mdx-components";

const toEditorTabValue = (value: string): EditorTabValue => {
  return value === "preview" ? "preview" : "markdown";
};

export function CreateLessonEditor() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [activeTab, setActiveTab] = useState<EditorTabValue>("markdown");

  const canSave = useMemo(() => title.trim().length > 0, [title]);
  const mdxComponents = useMemo(() => getMDXComponents(), []);

  const { applyBlockquote, applyInlineToken, applyMathBlock, applyMathInline } =
    useMarkdownFormatting({
      body,
      setBody,
      textareaRef,
    });

  const { isCompilingPreview, previewBody, previewError } = useMdxPreview({
    enabled: activeTab === "preview",
    source: body,
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col px-4 lg:px-14">
      <section className="space-y-4">
        <Tabs
          className="gap-0"
          onValueChange={(value) => setActiveTab(toEditorTabValue(value))}
          value={activeTab}
        >
          <EditorHeader
            activeTab={activeTab}
            canSave={canSave}
            onBlockquote={applyBlockquote}
            onBold={() => applyInlineToken(INLINE_TOKENS.bold)}
            onItalic={() => applyInlineToken(INLINE_TOKENS.italic)}
            onMathBlock={applyMathBlock}
            onMathInline={applyMathInline}
            onStrikethrough={() =>
              applyInlineToken(INLINE_TOKENS.strikethrough)
            }
            onTitleChange={setTitle}
            title={title}
          />
          <TabsPanel
            aria-labelledby={EDITOR_TAB_MARKDOWN_ID}
            id={EDITOR_PANEL_MARKDOWN_ID}
            value="markdown"
          >
            <MarkdownEditorPane
              body={body}
              onBodyChange={setBody}
              textareaRef={textareaRef}
            />
          </TabsPanel>
          <TabsPanel
            aria-labelledby={EDITOR_TAB_PREVIEW_ID}
            id={EDITOR_PANEL_PREVIEW_ID}
            value="preview"
          >
            <PreviewPane
              body={body}
              isCompilingPreview={isCompilingPreview}
              mdxComponents={mdxComponents}
              previewBody={previewBody}
              previewError={previewError}
            />
          </TabsPanel>
        </Tabs>
      </section>
    </div>
  );
}
