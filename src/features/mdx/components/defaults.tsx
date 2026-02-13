import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ImgHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

const externalLinkPattern = /^https?:\/\//;
const defaultImageWidth = 1200;
const defaultImageHeight = 630;

const parseDimension = (
  value: number | string | undefined
): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

const Anchor = ({
  href,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  if (!href) {
    return <a className={className} {...props} />;
  }

  const isExternal = externalLinkPattern.test(href);
  const combinedClassName = cn(className);

  if (isExternal) {
    return (
      <a
        className={combinedClassName}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        {...props}
      />
    );
  }

  return <Link className={combinedClassName} href={href} {...props} />;
};

const MdxImage = ({
  src,
  alt,
  className,
  width,
  height,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) => {
  if (!src || typeof src !== "string") {
    return null;
  }

  const numericWidth = parseDimension(width);
  const numericHeight = parseDimension(height);
  const imageClassName = cn("my-6 rounded-xl border", className);
  const resolvedWidth = numericWidth ?? defaultImageWidth;
  const resolvedHeight = numericHeight ?? defaultImageHeight;

  return (
    <Image
      alt={alt ?? ""}
      className={imageClassName}
      height={resolvedHeight}
      src={src}
      style={
        numericWidth && numericHeight
          ? undefined
          : { height: "auto", width: "100%" }
      }
      unoptimized
      width={resolvedWidth}
      {...props}
    />
  );
};

const Pre = ({ className, ...props }: HTMLAttributes<HTMLPreElement>) => {
  return (
    <pre
      className={cn(
        "not-prose my-6 overflow-x-auto rounded-xl border bg-muted px-4 py-3 font-mono text-sm",
        className
      )}
      {...props}
    />
  );
};

export const defaultComponents: MDXComponents = {
  a: Anchor,
  code: ({ className, ...props }: HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        "rounded bg-muted px-1.5 py-0.5 font-mono text-sm",
        className
      )}
      {...props}
    />
  ),
  img: MdxImage,
  pre: Pre,
};
