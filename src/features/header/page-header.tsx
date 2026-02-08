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

export function PageHeader() {
  return (
    <header className="sticky top-0 z-20 border-border/60 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="flex h-12 items-center gap-4 px-6 text-foreground">
        <SidebarTrigger className="text-foreground/80 hover:text-foreground" />
        <div className="flex min-w-0 flex-1 items-center">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/lessons">Lessons</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <ModeToggle className="text-foreground/80 hover:text-foreground" />
      </div>
    </header>
  );
}
