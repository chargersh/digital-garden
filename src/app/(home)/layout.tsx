import type { ReactNode } from "react";

interface HomeLayoutProps {
  children: ReactNode;
}

export default async function HomeLayout({ children }: HomeLayoutProps) {
  return children;
}
