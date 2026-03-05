import { GripVerticalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortableItemHandle } from "@/components/ui/sortable";

interface StudioSortableHandleButtonProps {
  ariaLabel: string;
}

export function StudioSortableHandleButton({
  ariaLabel,
}: StudioSortableHandleButtonProps) {
  return (
    <SortableItemHandle asChild>
      <Button
        aria-label={ariaLabel}
        onPointerUp={(event) => {
          event.currentTarget.blur();
        }}
        size="icon-xs"
        type="button"
        variant="ghost"
      >
        <GripVerticalIcon aria-hidden="true" />
      </Button>
    </SortableItemHandle>
  );
}
