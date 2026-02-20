"use client";

import type { RefObject } from "react";
import { normalizeRange } from "@/features/editor/lib/selection";

interface UseMarkdownFormattingArgs {
  body: string;
  setBody: (body: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

const BLOCKQUOTE_PREFIX_REGEX = /^> /;

export const INLINE_TOKENS = {
  bold: "**",
  italic: "_",
  strikethrough: "~~",
} as const;

export function useMarkdownFormatting({
  body,
  setBody,
  textareaRef,
}: UseMarkdownFormattingArgs) {
  const updateBodyAndSelection = (
    nextBody: string,
    start: number,
    end: number
  ) => {
    setBody(nextBody);

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      textarea.focus();
      textarea.setSelectionRange(start, end);
    });
  };

  const applyInlineToken = (token: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const tokenLength = token.length;
    const range = normalizeRange({
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    });
    const selected = body.slice(range.start, range.end);

    const hasTokenAroundSelection =
      range.start >= tokenLength &&
      body.slice(range.start - tokenLength, range.start) === token &&
      body.slice(range.end, range.end + tokenLength) === token;

    if (hasTokenAroundSelection) {
      const nextBody = `${body.slice(0, range.start - tokenLength)}${selected}${body.slice(range.end + tokenLength)}`;
      updateBodyAndSelection(
        nextBody,
        range.start - tokenLength,
        range.end - tokenLength
      );
      return;
    }

    if (
      range.start !== range.end &&
      selected.length >= tokenLength * 2 &&
      selected.startsWith(token) &&
      selected.endsWith(token)
    ) {
      const unwrapped = selected.slice(tokenLength, -tokenLength);
      const nextBody = `${body.slice(0, range.start)}${unwrapped}${body.slice(range.end)}`;
      updateBodyAndSelection(
        nextBody,
        range.start,
        range.start + unwrapped.length
      );
      return;
    }

    const nextBody = `${body.slice(0, range.start)}${token}${selected}${token}${body.slice(range.end)}`;
    const cursorStart = range.start + tokenLength;
    const cursorEnd =
      range.start === range.end ? cursorStart : range.end + tokenLength;
    updateBodyAndSelection(nextBody, cursorStart, cursorEnd);
  };

  const applyBlockquote = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const range = normalizeRange({
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    });
    const blockStart = body.lastIndexOf("\n", Math.max(range.start - 1, 0)) + 1;
    const nextNewline = body.indexOf("\n", range.end);
    const blockEnd = nextNewline === -1 ? body.length : nextNewline;
    const block = body.slice(blockStart, blockEnd);
    const lines = block.split("\n");
    const shouldUnquote = lines.every((line) => line.startsWith("> "));
    const transformed = lines
      .map((line) => {
        if (line.length === 0) {
          return shouldUnquote ? line : "> ";
        }
        return shouldUnquote
          ? line.replace(BLOCKQUOTE_PREFIX_REGEX, "")
          : `> ${line}`;
      })
      .join("\n");

    const nextBody = `${body.slice(0, blockStart)}${transformed}${body.slice(blockEnd)}`;
    updateBodyAndSelection(
      nextBody,
      blockStart,
      blockStart + transformed.length
    );
  };

  const applyMathInline = () => {
    applyInlineToken("$");
  };

  const applyMathBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const range = normalizeRange({
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    });
    const selected = body.slice(range.start, range.end);
    const wrapperStart = "$$\n";
    const wrapperEnd = "\n$$";
    const nextBody = `${body.slice(0, range.start)}${wrapperStart}${selected}${wrapperEnd}${body.slice(range.end)}`;

    const cursorStart = range.start + wrapperStart.length;
    const cursorEnd =
      range.start === range.end ? cursorStart : cursorStart + selected.length;
    updateBodyAndSelection(nextBody, cursorStart, cursorEnd);
  };

  return {
    applyBlockquote,
    applyInlineToken,
    applyMathBlock,
    applyMathInline,
  };
}
