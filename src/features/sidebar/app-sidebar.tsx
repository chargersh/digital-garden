import { ChevronDown, ChevronRight, GalleryVerticalEnd } from "lucide-react";
import type { ComponentProps } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

const data: {
  navMain: {
    title: string;
    url: string;
    items: { title: string; url: string; isActive?: boolean }[];
  }[];
} = {
  navMain: [
    {
      title: "Getting Started",
      url: "/",
      items: [
        {
          title: "Installation",
          url: "/",
        },
        {
          title: "Project Structure",
          url: "/",
        },
      ],
    },
    {
      title: "Building Your Application",
      url: "/",
      items: [
        {
          title: "Routing",
          url: "/",
        },
        {
          title: "Data Fetching",
          url: "/",
          isActive: true,
        },
        {
          title: "Rendering",
          url: "/",
        },
        {
          title: "Caching",
          url: "/",
        },
        {
          title: "Styling",
          url: "/",
        },
        {
          title: "Optimizing",
          url: "/",
        },
        {
          title: "Configuring",
          url: "/",
        },
        {
          title: "Testing",
          url: "/",
        },
        {
          title: "Authentication",
          url: "/",
        },
        {
          title: "Deploying",
          url: "/",
        },
        {
          title: "Upgrading",
          url: "/",
        },
        {
          title: "Examples",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Documentation</span>
                  <span className="text-muted-foreground text-xs">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <Collapsible
                className="group/collapsible"
                defaultOpen
                key={item.title}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      {item.title}
                      <ChevronRight className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <ChevronDown className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {item.items?.length ? (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={subItem.isActive}
                            >
                              <a href={subItem.url}>{subItem.title}</a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
