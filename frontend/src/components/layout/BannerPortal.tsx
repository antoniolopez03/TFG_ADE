"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type BannerPortalProps = {
  children: React.ReactNode;
};

export function BannerPortal({ children }: BannerPortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setContainer(document.getElementById("global-banner"));
  }, []);

  if (!container) {
    return null;
  }

  return createPortal(children, container);
}
