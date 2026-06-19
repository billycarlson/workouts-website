import type { HTMLAttributes, ReactNode } from "react";

type RasterGridAttributes = HTMLAttributes<HTMLElement> & {
  columns?: string | number;
  "columns-s"?: string | number;
  "columns-l"?: string | number;
  children?: ReactNode;
};

type RasterCellAttributes = HTMLAttributes<HTMLElement> & {
  span?: string;
  "span-s"?: string;
  "span-l"?: string;
  children?: ReactNode;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "r-grid": RasterGridAttributes;
      "r-cell": RasterCellAttributes;
    }
  }
}

export {};
