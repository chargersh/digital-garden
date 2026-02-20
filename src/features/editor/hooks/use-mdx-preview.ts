"use client";

import { compile, run } from "@mdx-js/mdx";
import type { MDXContent, MDXModule } from "mdx/types";
import { useEffect, useState } from "react";
import { jsxDEV } from "react/jsx-dev-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { getMdxPreset } from "@/features/mdx/preset";

interface UseMdxPreviewArgs {
  enabled: boolean;
  source: string;
}

interface UseMdxPreviewResult {
  isCompilingPreview: boolean;
  previewBody: MDXContent | null;
  previewError: string | null;
}

const PREVIEW_SOURCE_PATH = "editor:preview.mdx";

const compilePreviewMdx = async (source: string): Promise<MDXContent> => {
  const preset = getMdxPreset();
  const compiled = await compile(
    {
      path: PREVIEW_SOURCE_PATH,
      value: source,
    },
    {
      development: process.env.NODE_ENV !== "production",
      format: "mdx",
      outputFormat: "function-body",
      rehypePlugins: preset.rehypePlugins,
      remarkPlugins: preset.remarkPlugins,
    }
  );

  const evaluated = (await run(compiled, {
    Fragment,
    jsx,
    jsxDEV,
    jsxs,
  })) as MDXModule;

  if (typeof evaluated.default !== "function") {
    throw new Error("Preview compile did not return a React component.");
  }

  return evaluated.default as MDXContent;
};

export function useMdxPreview({
  enabled,
  source,
}: UseMdxPreviewArgs): UseMdxPreviewResult {
  const [previewBody, setPreviewBody] = useState<MDXContent | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isCompilingPreview, setIsCompilingPreview] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (source.trim().length === 0) {
      setPreviewBody(null);
      setPreviewError(null);
      setIsCompilingPreview(false);
      return;
    }

    let isCancelled = false;
    const timeout = window.setTimeout(async () => {
      setIsCompilingPreview(true);
      try {
        const compiledBody = await compilePreviewMdx(source);
        if (isCancelled) {
          return;
        }

        setPreviewBody(() => compiledBody);
        setPreviewError(null);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setPreviewBody(null);
        setPreviewError(
          error instanceof Error
            ? error.message
            : "Unknown preview compile error."
        );
      } finally {
        if (!isCancelled) {
          setIsCompilingPreview(false);
        }
      }
    }, 150);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeout);
    };
  }, [enabled, source]);

  return {
    isCompilingPreview,
    previewBody,
    previewError,
  };
}
