"use client";

import { useCallback, useState } from "react";
import Nav from "@/components/layout/Nav";
import ProjectsGrid from "@/components/layout/ProjectsGrid";
import type { Project } from "@/lib/queries";

type OverlayState = {
  projectId: string;
  startIndex: number;
  projectTitle: string;
  totalSlides: number;
} | null;

type ProjectsPageClientProps = {
  projects: Project[];
};

export default function ProjectsPageClient({ projects }: ProjectsPageClientProps) {
  const [overlay, setOverlay] = useState<OverlayState>(null);
  const [overlaySlideIndex, setOverlaySlideIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState<"left" | "right" | null>(null);
  const [directionChangeKey, setDirectionChangeKey] = useState(0);

  const openOverlay = useCallback(
    (projectId: string, startIndex: number, projectTitle: string, totalSlides: number) => {
      setOverlay({ projectId, startIndex, projectTitle, totalSlides });
      setOverlaySlideIndex(startIndex);
    },
    []
  );
  const closeOverlay = useCallback(() => setOverlay(null), []);
  const handleOverlaySlideChange = useCallback((index: number) => {
    setOverlaySlideIndex(index);
  }, []);
  const handleOverlayPrevClick = useCallback(() => {
    setLastDirection("left");
    setDirectionChangeKey((k) => k + 1);
  }, []);
  const handleOverlayNextClick = useCallback(() => {
    setLastDirection("right");
    setDirectionChangeKey((k) => k + 1);
  }, []);

  return (
    <>
      <div className="absolute left-[20px] top-[20px] z-10">
        {overlay ? (
          <Nav
            variant="hover"
            currentSlideTitle={overlay.projectTitle}
            currentSlideIndex={overlaySlideIndex}
            totalSlides={overlay.totalSlides}
            lastDirection={lastDirection}
            directionChangeKey={directionChangeKey}
          />
        ) : (
          <Nav variant="projects" />
        )}
      </div>
      <ProjectsGrid
        projects={projects}
        overlay={overlay}
        overlaySlideIndex={overlaySlideIndex}
        onOpenOverlay={openOverlay}
        onCloseOverlay={closeOverlay}
        onOverlaySlideChange={handleOverlaySlideChange}
        onOverlayPrevClick={handleOverlayPrevClick}
        onOverlayNextClick={handleOverlayNextClick}
      />
    </>
  );
}
