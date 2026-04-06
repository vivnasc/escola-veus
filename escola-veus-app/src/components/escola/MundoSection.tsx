"use client";

import { ReactNode } from "react";

interface MundoSectionProps {
  children: ReactNode;
  variant?: "sky" | "sky-dawn" | "surface";
  className?: string;
}

export default function MundoSection({
  children,
  variant = "sky",
  className = "",
}: MundoSectionProps) {
  const variantClass =
    variant === "sky"
      ? "mundo-sky"
      : variant === "sky-dawn"
        ? "mundo-sky-dawn"
        : "mundo-section";

  return (
    <section className={`${variantClass} mundo-section ${className}`}>
      {children}
    </section>
  );
}
