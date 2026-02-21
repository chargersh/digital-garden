import type { ReactNode } from "react";

export interface TocItem {
  depth: number;
  title: ReactNode;
  url: string;
}
