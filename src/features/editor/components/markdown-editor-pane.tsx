"use client";

import type { RefObject } from "react";
import { Textarea } from "@/components/ui/textarea";
import { renderBodyWithEmphasis } from "@/features/editor/lib/render-body-with-emphasis";

interface MarkdownEditorPaneProps {
  body: string;
  onBodyChange: (value: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

export function MarkdownEditorPane({
  body,
  onBodyChange,
  textareaRef,
}: MarkdownEditorPaneProps) {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 max-h-none min-h-[68vh] overflow-hidden whitespace-pre-wrap break-words rounded-none border-none bg-transparent px-0 py-0 font-mono text-base text-foreground md:text-sm"
      >
        {renderBodyWithEmphasis(body)}
      </div>
      <Textarea
        aria-label="Lesson content"
        className="relative z-10 max-h-none min-h-[68vh] resize-none overflow-hidden rounded-none border-none bg-transparent px-0 py-0 font-mono text-base text-transparent caret-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0 md:text-sm dark:bg-transparent"
        onChange={(event) => onBodyChange(event.target.value)}
        placeholder="Write your lesson in MDX..."
        ref={textareaRef}
        value={body}
      />
    </div>
  );
}
