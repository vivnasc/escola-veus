"use client";

interface MundoQuoteProps {
  text: string;
  autor?: string;
  shimmer?: boolean;
  className?: string;
}

export default function MundoQuote({
  text,
  autor,
  shimmer = false,
  className = "",
}: MundoQuoteProps) {
  return (
    <blockquote className={`text-center py-12 px-6 ${className}`}>
      <p
        className={`
          mundo-heading text-xl md:text-2xl lg:text-3xl leading-relaxed
          ${shimmer ? "mundo-shimmer" : ""}
        `}
        style={{ fontStyle: "italic", fontWeight: 300 }}
      >
        {text}
      </p>
      {autor && (
        <footer className="mt-6">
          <span
            className="mundo-subheading text-xs"
            style={{ color: "var(--color-mundo-dourado)", opacity: 0.6 }}
          >
            {autor}
          </span>
        </footer>
      )}
    </blockquote>
  );
}
