"use client";

import { EmblaCarousel } from "@/components/ui/EmblaCarousel";
import OptimizedImage from "@/components/images/OptimizedImage";

/**
 * Reusable slide item shape: title + image (Sanity or compatible).
 * Use with homepage items, project galleries, or any list of title/image slides.
 */
export interface SlideshowItem {
  title?: string;
  image?: {
    asset?: { _ref: string; _type?: string };
    alt?: string;
  };
}

export type SlideshowProps = {
  /** List of slides (title + image). Can come from Sanity or any source. */
  items: SlideshowItem[];
  /** Optional class for the carousel wrapper */
  className?: string;
  /** Show previous/next buttons */
  showPrevNext?: boolean;
  /** Called when the selected slide index changes */
  onSlideChange?: (index: number) => void;
  /** Called when the previous button is clicked (e.g. to sync direction in nav) */
  onPrevClick?: () => void;
  /** Called when the next button is clicked (e.g. to sync direction in nav) */
  onNextClick?: () => void;
  /** Image sizes hint for OptimizedImage (default "400px") */
  imageSizes?: string;
  /** Aspect ratio class for each slide (default aspect-[4/3]) */
  slideAspectRatio?: string;
  /** Initial slide index (e.g. when opening overlay on a specific cell) */
  initialSlideIndex?: number;
  /** How the image fits in each slide: "cover" (fill, may crop) or "contain" (fit, no crop) */
  imageFit?: "cover" | "contain";
};

export default function Slideshow({
  items,
  className = "",
  showPrevNext = true,
  onSlideChange,
  onPrevClick,
  onNextClick,
  imageSizes = "400px",
  slideAspectRatio = "aspect-[4/3]",
  initialSlideIndex = 0,
  imageFit = "cover",
}: SlideshowProps) {
  if (!items?.length) return null;

  const imageClassName = imageFit === "contain" ? "object-contain" : "object-cover";
  const objectFit = imageFit === "contain" ? "contain" : "cover";

  return (
    <EmblaCarousel
      className={className}
      showPrevNext={showPrevNext}
      options={initialSlideIndex > 0 ? { startIndex: initialSlideIndex } : undefined}
      onSlideChange={onSlideChange}
      onPrevClick={onPrevClick}
      onNextClick={onNextClick}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`relative flex w-full items-center justify-center overflow-hidden ${slideAspectRatio}`}
        >
          {item.image?.asset && (
            <OptimizedImage
              image={item.image}
              alt={item.image.alt || item.title || `Slide ${idx + 1}`}
              fill
              sizes={imageSizes}
              className={imageClassName}
              objectFit={objectFit}
              objectPosition="center"
            />
          )}
        </div>
      ))}
    </EmblaCarousel>
  );
}
