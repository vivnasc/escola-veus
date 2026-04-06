/**
 * Shared image export utility for the marketing tools.
 *
 * Uses html-to-image (toPng) with:
 *  - explicit image-load awaiting (cross-origin images need time to decode)
 *  - double-call pattern (first pass caches blob URLs; second pass captures)
 *  - isMobile detection via UA + maxTouchPoints
 */

export function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const touch = navigator.maxTouchPoints > 0;
  return ua || touch;
}

/** Wait for all <img> inside an element to finish loading. */
async function waitForImages(el: HTMLElement): Promise<void> {
  const imgs = Array.from(el.querySelectorAll<HTMLImageElement>("img"));
  await Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((res) => {
            img.onload = () => res();
            img.onerror = () => res();
          })
    )
  );
}

export interface CaptureOptions {
  width: number;
  height: number;
  /** Filename without extension, used for desktop download */
  filename: string;
  pixelRatio?: number;
}

/**
 * Captures a DOM element as a PNG.
 *
 * Temporarily expands the element to its real export size, captures,
 * then restores original styles.
 *
 * On mobile: returns the data URL so the caller can show a full-screen
 * preview (long-press to save). On desktop: triggers a direct download.
 *
 * Returns the data URL in both cases (useful for mobile preview UIs).
 */
export async function captureElement(
  el: HTMLElement,
  opts: CaptureOptions
): Promise<string> {
  const { toPng } = await import("html-to-image");

  const { width, height, filename, pixelRatio = 1 } = opts;
  const parent = el.parentElement as HTMLElement | null;

  // Save original styles
  const origEl = { t: el.style.transform, w: el.style.width, h: el.style.height };
  const origParent = parent
    ? {
        w: parent.style.width,
        h: parent.style.height,
        o: parent.style.overflow,
        r: parent.style.borderRadius,
      }
    : null;

  // Expand to real export size
  el.style.transform = "none";
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
  if (parent) {
    parent.style.width = `${width}px`;
    parent.style.height = `${height}px`;
    parent.style.overflow = "visible";
    parent.style.borderRadius = "0";
  }

  // Wait for layout + images
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await waitForImages(el);

  const toPngOpts = { width, height, pixelRatio, cacheBust: true };

  // First pass: primes the internal blob-URL cache for cross-origin images
  await toPng(el, toPngOpts);
  // Second pass: renders correctly with all images present
  const dataUrl = await toPng(el, toPngOpts);

  // Restore styles
  el.style.transform = origEl.t;
  el.style.width = origEl.w;
  el.style.height = origEl.h;
  if (parent && origParent) {
    parent.style.width = origParent.w;
    parent.style.height = origParent.h;
    parent.style.overflow = origParent.o;
    parent.style.borderRadius = origParent.r;
  }

  // Desktop: direct download
  if (!isMobile()) {
    const a = document.createElement("a");
    a.download = `${filename}.png`;
    a.href = dataUrl;
    a.click();
  }

  return dataUrl;
}
