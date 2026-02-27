"use client";

import { useState } from "react";
import Nav from "@/components/layout/Nav";
import type { HomepageSlideshowItem } from "@/lib/queries";
import MediaSlideshow, {
  MediaSlideshowItem,
} from "@/components/slideshow/MediaSlideshow";

type HomePageContentProps = {
  items: HomepageSlideshowItem[];
};

export default function HomePageContent({ items }: HomePageContentProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState<"left" | "right" | null>(null);
  const [directionChangeKey, setDirectionChangeKey] = useState(0);

  const currentTitle = items[selectedIndex]?.title ?? "";
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

  const slideshowItems: MediaSlideshowItem[] = items.map((item) => {
    const hasVideo =
      item.video &&
      (item.video.videoType === "mux"
        ? item.video.muxPlaybackId
        : item.video.videoType === "file"
          ? item.video.videoFile?.asset
          : false);
    const media: MediaSlideshowItem["media"] = hasVideo
      ? { ...item.video, _type: "video" as const }
      : item.image ?? null;
    return {
      media,
      alt: item.video?.alt ?? item.image?.alt ?? item.title ?? "",
    };
  });

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
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <MediaSlideshow
          items={slideshowItems}
          currentIndex={selectedIndex}
          onPrev={goPrev}
          onNext={goNext}
          maxHeightClassName="max-h-[600px]"
          width={800}
          mediaProps={{
            sizes: "(max-width: 768px) 100vw, 800px",
          }}
        />
      </div>
    </>
  );
}
