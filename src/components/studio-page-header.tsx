"use client";

import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/page-header";

const STUDIO_CREATE_ROUTE_PATTERN = /^\/studio\/[^/]+\/create\/?$/;

export function StudioPageHeader() {
  const pathname = usePathname();

  if (STUDIO_CREATE_ROUTE_PATTERN.test(pathname)) {
    return null;
  }

  return <PageHeader />;
}
