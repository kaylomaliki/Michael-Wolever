"use client";

import { useState } from "react";
import Nav from "@/components/layout/Nav";
import { urlForImage } from "@/lib/image";
import type { HomepageSlideshowItem } from "@/lib/queries";

type HomePageContentProps = {
  items: HomepageSlideshowItem[];
};

export default function HomePageContent({ items }: HomePageContentProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState<"left" | "right" | null>(null);
  const [directionChangeKey, setDirectionChangeKey] = useState(0);

  const currentTitle = items[selectedIndex]?.title ?? "";
  const currentItem = items[selectedIndex];
  const n = items.length;

  const goPrev = () => {
    setSelectedIndex((i) => (i - 1 + n) % n);
    setLastDirection("left");
    setDirectionChangeKey((k) => k + 1);
  };
  const goNext = () => {
    setSelectedIndex((i) => (i + 1) % n);
    setLastDirection("right");
    setDirectionChangeKey((k) => k + 1);
  };

  return (
    <>
      <div className="fixed left-[20px] top-[20px] z-10">
        <Nav
          variant="hover"
          currentSlideTitle={currentTitle}
          currentSlideIndex={selectedIndex}
          totalSlides={items.length}
          lastDirection={lastDirection}
          directionChangeKey={directionChangeKey}
        />
      </div>
      <div className="flex w-full flex-col items-center justify-center">
        <div className="relative flex max-h-[600px] items-center justify-center">
          {currentItem?.image?.asset && (
            <>
              <button
                type="button"
                className="absolute left-0 top-0 z-10 h-full w-1/2 cursor-pointer border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
                onClick={goPrev}
                aria-label="Previous image"
              />
              <img
                src={urlForImage(currentItem.image).width(1200).url()}
                alt={currentItem.image?.alt ?? currentTitle ?? `Slide ${selectedIndex + 1}`}
                className="max-h-[600px] w-auto object-contain"
              />
              <button
                type="button"
                className="absolute right-0 top-0 z-10 h-full w-1/2 cursor-pointer border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
                onClick={goNext}
                aria-label="Next image"
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
