import { ExternalLink } from "lucide-react";

export const MarkdownComponents = {
  // Images: constrained to fit bubble, rounded corners, lazy loading
  img: ({ alt, src, title }: { alt: string; src: string; title: string }) => {
    // Optimize Cloudinary Images
    let optimizedSrc = src;
    if (src.includes("cloudinary.com") && src.includes("/upload/")) {
      // Inject transformations: f_auto (format), q_auto (quality), w_500 (width limit)
      optimizedSrc = src.replace("/upload/", "/upload/f_auto,q_auto,w_500/");
    }

    return (
      <img
        alt={alt}
        src={optimizedSrc}
        title={title}
        className="rounded-lg max-w-full h-auto mt-2 mb-2 border border-border bg-muted/50"
        loading="lazy"
      />
    );
  },
  // Lists: restore bullets/numbers that Tailwind resets
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="pl-1">{children}</li>
  ),
  // Text: handle spacing
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
  ),
  // Links: Make them visible and open in new tab
  a: ({ children, href }: { children: React.ReactNode; href?: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:underline inline-flex items-baseline gap-0.5"
    >
      {children} <ExternalLink className="w-3 h-3 self-center" />
    </a>
  ),
};
