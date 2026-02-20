"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EditorTabs,
  type EditorTabValue,
} from "@/features/editor/components/editor-tabs";
import { FormattingToolbar } from "@/features/editor/components/formatting-toolbar";
import { LessonVisibilitySelect } from "@/features/editor/components/lesson-visibility-select";

interface EditorHeaderProps {
  activeTab: EditorTabValue;
  canSave: boolean;
  onBlockquote: () => void;
  onBold: () => void;
  onItalic: () => void;
  onMathBlock: () => void;
  onMathInline: () => void;
  onStrikethrough: () => void;
  onTitleChange: (value: string) => void;
  title: string;
}

export function EditorHeader({
  activeTab,
  canSave,
  onBlockquote,
  onBold,
  onItalic,
  onMathBlock,
  onMathInline,
  onStrikethrough,
  onTitleChange,
  title,
}: EditorHeaderProps) {
  return (
    <div className="sticky top-0 z-10 space-y-4 bg-background/95 pt-5 pb-3 backdrop-blur supports-backdrop-filter:bg-background/80">
      <Input
        aria-label="Lesson title"
        className="h-auto rounded-none border-none bg-transparent px-0 py-0 font-semibold text-3xl tracking-tight shadow-none focus-visible:ring-0 md:text-4xl dark:bg-transparent"
        id="lesson-title-input"
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Untitled lesson"
        value={title}
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <LessonVisibilitySelect />
          {activeTab === "markdown" ? (
            <FormattingToolbar
              onBlockquote={onBlockquote}
              onBold={onBold}
              onItalic={onItalic}
              onMathBlock={onMathBlock}
              onMathInline={onMathInline}
              onStrikethrough={onStrikethrough}
            />
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <EditorTabs />
          <Button disabled={!canSave} size="sm">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
