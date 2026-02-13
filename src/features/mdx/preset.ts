import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { rehypeToc } from "@/features/mdx/plugins/rehype-toc";
import type { RemarkHeadingOptions } from "@/features/mdx/plugins/remark-heading";
import { remarkHeading } from "@/features/mdx/plugins/remark-heading";

type RemarkMathOptions = NonNullable<Parameters<typeof remarkMath>[0]>;

export interface MdxPreset {
  rehypePlugins: [typeof rehypeKatex, typeof rehypeToc];
  remarkPlugins: [
    typeof remarkGfm,
    [typeof remarkMath, RemarkMathOptions],
    [typeof remarkHeading, RemarkHeadingOptions],
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
