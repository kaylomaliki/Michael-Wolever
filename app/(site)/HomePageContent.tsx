"use client";

import { useState } from "react";
import Slideshow from "@/components/slideshow/Slideshow";
import Nav from "@/components/layout/Nav";
import type { HomepageSlideshowItem } from "@/lib/queries";

type HomePageContentProps = {
  items: HomepageSlideshowItem[];
};

export default function HomePageContent({ items }: HomePageContentProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState<"left" | "right" | null>(null);
  const [directionChangeKey, setDirectionChangeKey] = useState(0);

  const currentTitle = items[selectedIndex]?.title ?? "";

  return (
    <>
      <div className="absolute left-[20px] top-[20px]">
        <Nav
          variant="hover"
          currentSlideTitle={currentTitle}
          currentSlideIndex={selectedIndex}
          totalSlides={items.length}
          lastDirection={lastDirection}
          directionChangeKey={directionChangeKey}
        />
      </div>
      <div className="flex w-full max-w-[600px] flex-col items-center">
        <div className="w-full">
          <Slideshow
            items={items}
            className="w-full max-w-[600px]"
            showPrevNext
            onSlideChange={setSelectedIndex}
            onPrevClick={() => {
              setLastDirection("left");
              setDirectionChangeKey((k) => k + 1);
            }}
            onNextClick={() => {
              setLastDirection("right");
              setDirectionChangeKey((k) => k + 1);
            }}
          />
        </div>
      </div>
    </>
  );
}
