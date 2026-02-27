"use client";

import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import { useCallback, useEffect, ReactNode, Children } from "react";

/**
 * Embla Carousel with infinite looping.
 * @see https://www.embla-carousel.com/get-started/react/
 * @see https://www.embla-carousel.com/api/options/#loop
 */
export type EmblaCarouselProps = {
  children: ReactNode;
  /** Carousel options; loop is true by default for infinite scroll */
  options?: EmblaOptionsType;
  /** Optional previous button (rendered outside viewport to avoid drag conflicts) */
  showPrevNext?: boolean;
  /** Optional class for the root wrapper */
  className?: string;
  /** Optional class for each slide wrapper */
  slideClassName?: string;
  /** Called when the selected slide index changes */
  onSlideChange?: (index: number) => void;
  /** Called when the previous (left) button is clicked, before scrolling */
  onPrevClick?: () => void;
  /** Called when the next (right) button is clicked, before scrolling */
  onNextClick?: () => void;
};

const defaultOptions: EmblaOptionsType = {
  loop: true,
  align: "start",
  duration: 0, // instant scroll (no animation between slides)
};

export function EmblaCarousel({
  children,
  options,
  showPrevNext = false,
  className = "",
  slideClassName = "",
  onSlideChange,
  onPrevClick,
  onNextClick,
}: EmblaCarouselProps) {
  const mergedOptions: EmblaOptionsType = {
    ...defaultOptions,
    ...options,
    loop: options?.loop ?? true,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(mergedOptions);

  useEffect(() => {
    if (!emblaApi || !onSlideChange) return;
    onSlideChange(emblaApi.selectedScrollSnap());
    const handler = () => onSlideChange(emblaApi.selectedScrollSnap());
    emblaApi.on("select", handler);
    return () => {
      emblaApi.off("select", handler);
    };
  }, [emblaApi, onSlideChange]);

  const scrollPrev = useCallback(() => {
    onPrevClick?.();
    emblaApi?.scrollPrev();
  }, [emblaApi, onPrevClick]);

  const scrollNext = useCallback(() => {
    onNextClick?.();
    emblaApi?.scrollNext();
  }, [emblaApi, onNextClick]);

  const slides = Children.toArray(children);

  return (
    <div className={`embla relative ${className}`}>
      <div
        className="embla__viewport overflow-hidden"
        ref={emblaRef}
      >
        <div className="embla__container flex touch-pan-y">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`embla__slide min-w-0 flex-[0_0_100%] ${slideClassName}`}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>
      {showPrevNext && (
        <>
          <button
            type="button"
            className="embla__prev absolute left-0 top-0 z-10 h-full w-1/2 cursor-w-resize border-0 bg-transparent p-0 opacity-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
            onClick={scrollPrev}
            aria-label="Previous slide"
          />
          <button
            type="button"
            className="embla__next absolute right-0 top-0 z-10 h-full w-1/2 cursor-e-resize border-0 bg-transparent p-0 opacity-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
            onClick={scrollNext}
            aria-label="Next slide"
          />
        </>
      )}
    </div>
  );
}

/**
 * Hook to use Embla API (e.g. for custom prev/next or dots).
 * Use with the same options as EmblaCarousel when building a custom UI.
 */
export function useEmblaCarouselLoop(options?: EmblaOptionsType) {
  const mergedOptions: EmblaOptionsType = {
    loop: true,
    align: "start",
    ...options,
  };
  return useEmblaCarousel(mergedOptions);
}
