"use client";

import { useEffect } from "react";
import { writeDisplayXxlEnabled } from "@/lib/display-mode";

export default function DisplayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    writeDisplayXxlEnabled(true);
  }, []);

  return <div className="garage-root">{children}</div>;
}
