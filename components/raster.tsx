import type { ReactNode } from "react";

type RasterGridProps = {
  columns?: number | string;
  columnsS?: number | string;
  columnsL?: number | string;
  className?: string;
  debug?: boolean;
  children: ReactNode;
};

type RasterCellProps = {
  span?: string | number;
  spanS?: string;
  spanL?: string | number;
  className?: string;
  children: ReactNode;
};

export function RasterGrid({
  columns = 12,
  columnsS,
  columnsL,
  className,
  debug,
  children,
}: RasterGridProps) {
  const classes = [className, debug ? "debug" : ""].filter(Boolean).join(" ");

  return (
    <r-grid
      columns={String(columns)}
      {...(columnsS !== undefined ? { "columns-s": String(columnsS) } : {})}
      {...(columnsL !== undefined ? { "columns-l": String(columnsL) } : {})}
      className={classes || undefined}
    >
      {children}
    </r-grid>
  );
}

export function RasterCell({ span, spanS, spanL, className, children }: RasterCellProps) {
  return (
    <r-cell
      {...(span !== undefined ? { span: String(span) } : {})}
      {...(spanS ? { "span-s": spanS } : {})}
      {...(spanL !== undefined ? { "span-l": String(spanL) } : {})}
      className={className}
    >
      {children}
    </r-cell>
  );
}
