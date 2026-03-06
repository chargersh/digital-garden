"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSubjectSidebar } from "@/features/sidebar/shared/subject-sidebar-context";

export function PageHeader() {
  const { breadcrumbItems } = useSubjectSidebar();

  return (
    <header className="sticky top-0 z-20 border-border/60 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="flex h-12 items-center gap-4 px-4 text-foreground lg:px-14">
        <div className="flex min-w-0 flex-1 items-center">
          <SidebarTrigger
            aria-label="Toggle sidebar"
            className="mr-2 -ml-2 size-8 text-foreground/80 hover:text-foreground md:hidden"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                let breadcrumbContent: ReactNode;

                if (isLast) {
                  breadcrumbContent = (
                    <BreadcrumbPage>{item.title}</BreadcrumbPage>
                  );
                } else if (item.href) {
                  breadcrumbContent = (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.title}</Link>
                    </BreadcrumbLink>
                  );
                } else {
                  breadcrumbContent = (
                    <span className="text-muted-foreground">{item.title}</span>
                  );
                }

                return (
                  <Fragment key={`${index}-${item.href ?? ""}-${item.title}`}>
                    {index > 0 ? <BreadcrumbSeparator /> : null}
                    <BreadcrumbItem>{breadcrumbContent}</BreadcrumbItem>
                  </Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <ModeToggle className="text-foreground/80 hover:text-foreground" />
      </div>
    </header>
  );
}
