import type { ReactNode } from "react";

const EMPHASIS_REGEX =
  /\*\*_(.+?)_\*\*|_\*\*(.+?)\*\*_|(?:\*\*\*|___)(.+?)(?:\*\*\*|___)|\*\*([^*]+)\*\*|_([^_]+)_/g;

export const renderBodyWithEmphasis = (source: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let index = 0;

  for (const match of source.matchAll(EMPHASIS_REGEX)) {
    const fullMatch = match[0];
    const start = match.index ?? 0;
    const end = start + fullMatch.length;

    if (start > cursor) {
      nodes.push(
        <span key={`text-${index}`}>{source.slice(cursor, start)}</span>
      );
      index += 1;
    }

    const boldInItalicContent = match[1];
    const italicInBoldContent = match[2];
    const tripleEmphasisContent = match[3];
    const boldContent = match[4];
    const italicContent = match[5];

    if (boldInItalicContent !== undefined) {
      nodes.push(
        <span key={`bold-italic-a-${index}`}>
          <span className="text-muted-foreground/65">**_</span>
          <span className="font-bold italic">{boldInItalicContent}</span>
          <span className="text-muted-foreground/65">_**</span>
        </span>
      );
      index += 1;
      cursor = end;
      continue;
    }

    if (italicInBoldContent !== undefined) {
      nodes.push(
        <span key={`bold-italic-b-${index}`}>
          <span className="text-muted-foreground/65">_**</span>
          <span className="font-bold italic">{italicInBoldContent}</span>
          <span className="text-muted-foreground/65">**_</span>
        </span>
      );
      index += 1;
      cursor = end;
      continue;
    }

    if (tripleEmphasisContent !== undefined) {
      const token = fullMatch.startsWith("***") ? "***" : "___";
      nodes.push(
        <span key={`bold-italic-c-${index}`}>
          <span className="text-muted-foreground/65">{token}</span>
          <span className="font-bold italic">{tripleEmphasisContent}</span>
          <span className="text-muted-foreground/65">{token}</span>
        </span>
      );
      index += 1;
      cursor = end;
      continue;
    }

    if (boldContent !== undefined) {
      nodes.push(
        <span key={`bold-${index}`}>
          <span className="text-muted-foreground/65">**</span>
          <span className="font-bold">{boldContent}</span>
          <span className="text-muted-foreground/65">**</span>
        </span>
      );
      index += 1;
      cursor = end;
      continue;
    }

    nodes.push(
      <span key={`italic-${index}`}>
        <span className="text-muted-foreground/65">_</span>
        <span className="italic">{italicContent}</span>
        <span className="text-muted-foreground/65">_</span>
      </span>
    );
    index += 1;
    cursor = end;
  }

  if (cursor < source.length) {
    nodes.push(<span key={`tail-${index}`}>{source.slice(cursor)}</span>);
  }

  return nodes;
};
