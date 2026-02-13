import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { rehypeToc } from "@/features/mdx/plugins/rehype-toc";
import { remarkHeading } from "@/features/mdx/plugins/remark-heading";

export interface MdxPreset {
  rehypePlugins: [typeof rehypeKatex, typeof rehypeToc];
  remarkPlugins: [
    typeof remarkGfm,
    [typeof remarkMath, { singleDollarTextMath: true }],
    [typeof remarkHeading, { generateToc: false }],
  ];
}

export const getMdxPreset = (): MdxPreset => {
  return {
    remarkPlugins: [
      remarkGfm,
      [remarkMath, { singleDollarTextMath: true }],
      [remarkHeading, { generateToc: false }],
    ],
    rehypePlugins: [rehypeKatex, rehypeToc],
  };
};
