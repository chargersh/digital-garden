"use client";

import type { MDXComponents, MDXContent } from "mdx/types";

interface PreviewPaneProps {
  body: string;
  isCompilingPreview: boolean;
  mdxComponents: MDXComponents;
  previewBody: MDXContent | null;
  previewError: string | null;
}

export function PreviewPane({
  body,
  isCompilingPreview,
  mdxComponents,
  previewBody,
  previewError,
}: PreviewPaneProps) {
  const PreviewBody = previewBody;

  return (
    <div className="min-h-[68vh] rounded-none border-none bg-transparent px-0 py-0">
      {body.trim().length === 0 ? (
        <p className="text-muted-foreground">Nothing to preview yet.</p>
      ) : null}
      {isCompilingPreview ? (
        <p className="text-muted-foreground">Compiling preview...</p>
      ) : null}
      {previewError ? (
        <pre className="custom-scrollbar overflow-x-auto rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 font-mono text-destructive text-sm">
          {previewError}
        </pre>
      ) : null}
      {PreviewBody ? (
        <article className="prose prose-slate prose-compact dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:font-medium text-foreground prose-code:before:content-none prose-code:after:content-none">
          <PreviewBody components={mdxComponents} />
        </article>
      ) : null}
    </div>
  );
}
