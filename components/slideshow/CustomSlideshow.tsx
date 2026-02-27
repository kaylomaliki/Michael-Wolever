"use client";

export type CustomSlideshowProps<T> = {
  /** List of slides (any shape; URL and alt come from getters) */
  items: T[];
  /** Current slide index (0-based) */
  currentIndex: number;
  /** Called when the user clicks the left (prev) area */
  onPrev: () => void;
  /** Called when the user clicks the right (next) area */
  onNext: () => void;
  /** Return the image URL for a slide, or "" if no image */
  getImageUrl: (item: T) => string;
  /** Return alt text for a slide */
  getAlt: (item: T, index: number) => string;
  /** Optional max height class for the image and wrapper (default max-h-[600px]) */
  maxHeightClassName?: string;
  /** Optional: call stopPropagation on prev/next click (e.g. when inside an overlay) */
  stopPropagationOnClick?: boolean;
};

const defaultMaxHeight = "max-h-[600px]";

const buttonBaseClass =
  "absolute top-0 z-10 h-full w-1/2 cursor-pointer border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white";
const prevButtonClass = `${buttonBaseClass} left-0`;
const nextButtonClass = `${buttonBaseClass} right-0`;

export default function CustomSlideshow<T>({
  items,
  currentIndex,
  onPrev,
  onNext,
  getImageUrl,
  getAlt,
  maxHeightClassName = defaultMaxHeight,
  stopPropagationOnClick = false,
}: CustomSlideshowProps<T>) {
  const currentItem = items[currentIndex];
  const imageUrl = currentItem ? getImageUrl(currentItem) : "";

  if (!currentItem || !imageUrl) {
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

  return (
    <div className={`relative flex ${maxHeightClassName} items-center justify-center`}>
      <button
        type="button"
        className={prevButtonClass}
        onClick={handlePrev}
        aria-label="Previous image"
      />
      <img
        src={imageUrl}
        alt={getAlt(currentItem, currentIndex)}
        className={`pointer-events-none ${maxHeightClassName} w-auto object-contain`}
        draggable={false}
      />
      <button
        type="button"
        className={nextButtonClass}
        onClick={handleNext}
        aria-label="Next image"
      />
    </div>
  );
}
