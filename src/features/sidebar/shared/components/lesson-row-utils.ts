import { SidebarMenuItem, SidebarMenuSubItem } from "@/components/ui/sidebar";

const BASE_INDENT_REM = 1;
const INDENT_STEP_REM = 0.75;

export const getIndent = (depth: number) => {
  return `${BASE_INDENT_REM + depth * INDENT_STEP_REM}rem`;
};

export const getMenuItemComponent = (depth: number) => {
  return depth === 0 ? SidebarMenuItem : SidebarMenuSubItem;
};
