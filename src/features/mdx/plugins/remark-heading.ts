import GithubSlugger from "github-slugger";
import type { Heading, Root } from "mdast";
import type { Transformer } from "unified";
import { visit } from "unist-util-visit";
import type { TocItem } from "@/features/toc/types";

declare module "vfile" {
  interface DataMap {
    toc?: TocItem[];
  }
}

declare module "mdast" {
  interface HeadingData extends Data {
    hProperties?: {
      id?: string;
    };
  }
}

const customIdPattern = /\s*\[#([^\]]+)]\s*$/;

const flattenNodeText = (value: unknown): string => {
  if (!value || typeof value !== "object") {
    return "";
  }

  if ("value" in value && typeof value.value === "string") {
    return value.value;
  }

  if (!("children" in value && Array.isArray(value.children))) {
    return "";
  }

  let text = "";
  for (const child of value.children) {
    text += flattenNodeText(child);
  }

  return text;
};

export interface RemarkHeadingOptions {
  slug?: (root: Root, heading: Heading, text: string) => string;
  customId?: boolean;
  generateToc?: boolean;
}

export const remarkHeading = ({
  slug: defaultSlug,
  customId = true,
  generateToc = true,
}: RemarkHeadingOptions = {}): Transformer<Root, Root> => {
  return (root, file) => {
    const slugger = new GithubSlugger();
    const tocItems: TocItem[] = [];

    visit(root, "heading", (heading: Heading) => {
      heading.data ??= {};
      heading.data.hProperties ??= {};
      const headingProperties = heading.data.hProperties;

      const finalChild = heading.children.at(-1);
      if (customId && finalChild?.type === "text") {
        const match = customIdPattern.exec(finalChild.value);
        const customSlug = match?.[1];
        if (customSlug) {
          headingProperties.id = customSlug;
          slugger.slug(customSlug);
          finalChild.value = finalChild.value.slice(0, match.index).trimEnd();
        }
      }

      const headingLabel = flattenNodeText(heading).trim();
      if (!headingProperties.id) {
        headingProperties.id = defaultSlug
          ? defaultSlug(root, heading, headingLabel)
          : slugger.slug(headingLabel);
      }

      if (generateToc) {
        tocItems.push({
          title: headingLabel,
          depth: heading.depth,
          url: `#${headingProperties.id}`,
        });
      }
    });

    if (generateToc) {
      file.data.toc = tocItems;
    }
  };
};
