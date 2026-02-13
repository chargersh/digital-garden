import { pathToFileURL } from "node:url";
import { compile, run } from "@mdx-js/mdx";
import type { MDXContent } from "mdx/types";
import { jsxDEV } from "react/jsx-dev-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { getMdxPreset } from "@/features/mdx/preset";
import type { TocItem } from "@/features/toc/types";

interface CompileMdxInput {
  filePath: string;
  source: string;
  cacheKey: string;
}

interface CompileMdxOutput {
  body: MDXContent;
  toc: TocItem[];
}

const compileCache = new Map<string, Promise<CompileMdxOutput>>();

const parseTocItem = (value: unknown): TocItem | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const title = "title" in value ? (value.title as TocItem["title"]) : null;
  const depth =
    "depth" in value && typeof value.depth === "number" ? value.depth : null;
  const url =
    "url" in value && typeof value.url === "string" ? value.url : null;

  if (!(title && depth != null && url)) {
    return null;
  }

  return { depth, title, url };
};

const coerceToc = (value: unknown): TocItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const tocItems: TocItem[] = [];
  for (const entry of value) {
    const tocItem = parseTocItem(entry);
    if (!tocItem) {
      continue;
    }

    tocItems.push(tocItem);
  }

  return tocItems;
};

export const compileMdxFile = async ({
  filePath,
  source,
  cacheKey,
}: CompileMdxInput): Promise<CompileMdxOutput> => {
  const existing = compileCache.get(cacheKey);
  if (existing) {
    return existing;
  }

  const pending = (async (): Promise<CompileMdxOutput> => {
    const preset = getMdxPreset();
    const compiled = await compile(
      {
        path: filePath,
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

    const evaluated = await run(compiled, {
      Fragment,
      baseUrl: pathToFileURL(filePath),
      jsx,
      jsxDEV,
      jsxs,
    });

    if (typeof evaluated.default !== "function") {
      throw new Error(
        `MDX file "${filePath}" did not compile to a React component default export.`
      );
    }

    return {
      body: evaluated.default as MDXContent,
      toc: coerceToc((evaluated as { toc?: unknown }).toc ?? compiled.data.toc),
    };
  })();

  compileCache.set(cacheKey, pending);

  try {
    return await pending;
  } catch (error) {
    compileCache.delete(cacheKey);
    throw error;
  }
};
