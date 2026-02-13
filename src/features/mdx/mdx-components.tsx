import type { MDXComponents } from "mdx/types";
import { Badge } from "@/components/ui/badge";
import { defaultComponents } from "@/features/mdx/components/defaults";

export const getMDXComponents = (components?: MDXComponents): MDXComponents => {
  return {
    ...defaultComponents,
    Badge,
    ...components,
  } satisfies MDXComponents;
};
