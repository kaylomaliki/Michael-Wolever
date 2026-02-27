"use client";

import { useState } from "react";
import OptimizedMedia, {
  MediaItem,
  OptimizedMediaProps,
} from "@/components/images/OptimizedMedia";

export type MediaSlideshowItem = {
  /** Image or video media from Sanity */
  media: MediaItem | null;
  /** Alt text for the slide */
  alt: string;
};

export type MediaSlideshowProps = {
  /** List of slides */
  items: MediaSlideshowItem[];
  /** Current slide index (0-based) */
  currentIndex: number;
  /** Called when the user clicks the left (prev) area */
  onPrev: () => void;
  /** Called when the user clicks the right (next) area */
  onNext: () => void;
  /** Optional max height class for the image and wrapper (default max-h-[600px]) */
  maxHeightClassName?: string;
  /** Optional: call stopPropagation on prev/next click (e.g. when inside an overlay) */
  stopPropagationOnClick?: boolean;
  /** Optional fixed width passed to OptimizedMedia (e.g. 800) */
  width?: number;
  /** Optional fixed height passed to OptimizedMedia */
  height?: number;
  /** Additional props forwarded to OptimizedMedia */
  mediaProps?: Omit<OptimizedMediaProps, "media" | "alt" | "width" | "height">;
};

const defaultMaxHeight = "max-h-[600px]";

const buttonBaseClass =
  "absolute top-0 z-10 h-full w-1/2 cursor-pointer border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white";
const prevButtonClass = `${buttonBaseClass} left-0`;
const nextButtonClass = `${buttonBaseClass} right-0`;

export default function MediaSlideshow({
  items,
  currentIndex,
  onPrev,
  onNext,
  maxHeightClassName = defaultMaxHeight,
  stopPropagationOnClick = false,
  width,
  height,
  mediaProps,
}: MediaSlideshowProps) {
  const currentItem = items[currentIndex];
  const [slideWidths, setSlideWidths] = useState<Record<number, number>>({});

  if (!currentItem || !currentItem.media) {
    return null;
  }

  const handlePrev = (e: React.MouseEvent) => {
    if (stopPropagationOnClick) e.stopPropagation();
    onPrev();
  };

  const handleNext = (e: React.MouseEvent) => {
    if (stopPropagationOnClick) e.stopPropagation();
    onNext();
  };

  const effectiveWidth = width ?? 800;
  const effectiveHeight =
    height ?? Math.round(effectiveWidth * 0.75); // 4:3 fallback aspect ratio

  const handleLoad: NonNullable<OptimizedMediaProps["onLoad"]> = (info) => {
    setSlideWidths((prev) => ({ ...prev, [currentIndex]: info.renderedWidth }));
    mediaProps?.onLoad?.(info);
  };

  const isVideo =
    currentItem.media &&
    ("videoType" in currentItem.media ||
      (currentItem.media as { _type?: string })._type === "video");
  const wrapperWidth =
    slideWidths[currentIndex] ?? (isVideo ? effectiveWidth : undefined) ?? effectiveWidth;

  const content = (
    <OptimizedMedia
      media={currentItem.media}
      alt={currentItem.alt}
      fill={false}
      width={effectiveWidth}
      height={effectiveHeight}
      {...mediaProps}
      onLoad={handleLoad}
      objectFit="contain"
      className={`${maxHeightClassName} max-h-full object-contain`}
    />
  );
  const innerWrapperClass = `pointer-events-none flex min-h-0 items-center justify-center ${maxHeightClassName}`;

  return (
    <div
      className={`relative flex min-h-0 ${maxHeightClassName} min-h-[200px] min-w-[200px] items-center justify-center`}
      style={{
        width: wrapperWidth,
        maxWidth: "100%",
      }}
    >
      <button
        type="button"
        className={prevButtonClass}
        onClick={handlePrev}
        aria-label="Previous media"
      />
      <div className={innerWrapperClass}>
        {content}
      </div>
      <button
        type="button"
        className={nextButtonClass}
        onClick={handleNext}
        aria-label="Next media"
      />
    </div>
  );
}

