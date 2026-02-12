import type { ReactNode } from "react";
import { TableOfContents } from "@/features/content/table-of-contents";

interface TocItem {
  id: string;
  label: string;
  depth?: number;
}

interface LessonFrameProps {
  children: ReactNode;
  tocItems: readonly TocItem[];
}

export function LessonFrame({ children, tocItems }: LessonFrameProps) {
  return (
    <div className="relative flex w-full flex-row-reverse gap-x-8 px-4 pt-6 lg:pt-10 lg:pr-10 lg:pl-14">
      <TableOfContents items={tocItems} />
      <div className="relative box-border flex w-full grow flex-col xl:w-[calc(100%-28rem)]">
        {children}
      </div>
    </div>
  );
}
