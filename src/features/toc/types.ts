import type { ReactNode } from "react";

export interface TocItem {
  title: ReactNode;
  depth: number;
  url: string;
}
