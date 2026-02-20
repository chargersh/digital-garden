"use client";

import {
  BoldIcon,
  ItalicIcon,
  QuoteIcon,
  SigmaIcon,
  SquareFunctionIcon,
  StrikethroughIcon,
} from "lucide-react";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

interface FormattingToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onStrikethrough: () => void;
  onBlockquote: () => void;
  onMathInline: () => void;
  onMathBlock: () => void;
}

const preventFocusLoss = (event: MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
};

export function FormattingToolbar({
  onBold,
  onItalic,
  onStrikethrough,
  onBlockquote,
  onMathInline,
  onMathBlock,
}: FormattingToolbarProps) {
  return (
    <div className="flex items-center">
      <ButtonGroup aria-label="Formatting toolbar">
        <Button
          aria-label="Bold"
          onClick={onBold}
          onMouseDown={preventFocusLoss}
          size="sm"
          type="button"
          variant="outline"
        >
          <BoldIcon />
        </Button>
        <Button
          aria-label="Italic"
          onClick={onItalic}
          onMouseDown={preventFocusLoss}
          size="sm"
          type="button"
          variant="outline"
        >
          <ItalicIcon />
        </Button>
        <Button
          aria-label="Strikethrough"
          onClick={onStrikethrough}
          onMouseDown={preventFocusLoss}
          size="sm"
          type="button"
          variant="outline"
        >
          <StrikethroughIcon />
        </Button>
        <Button
          aria-label="Blockquote"
          onClick={onBlockquote}
          onMouseDown={preventFocusLoss}
          size="sm"
          type="button"
          variant="outline"
        >
          <QuoteIcon />
        </Button>
        <Button
          aria-label="Math inline"
          onClick={onMathInline}
          onMouseDown={preventFocusLoss}
          size="sm"
          type="button"
          variant="outline"
        >
          <SigmaIcon />
        </Button>
        <Button
          aria-label="Math block"
          onClick={onMathBlock}
          onMouseDown={preventFocusLoss}
          size="sm"
          type="button"
          variant="outline"
        >
          <SquareFunctionIcon />
        </Button>
      </ButtonGroup>
    </div>
  );
}
