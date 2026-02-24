"use client";

import { useCallback, useMemo, useState } from "react";
import PortableText from "@/components/sanity/PortableText";
import Slideshow from "@/components/slideshow/Slideshow";
import type { SlideshowItem } from "@/components/slideshow/Slideshow";
import { urlForImage } from "@/lib/image";
import type { Project } from "@/lib/queries";
import type { PortableTextBlock } from "@portabletext/types";

/** Plain text from project title (blocks or legacy string) for alt text etc. */
function projectTitleToPlainText(title: Project["title"]): string {
  if (typeof title === "string") return title;
  if (!Array.isArray(title)) return "";
  return title
    .map(
      (block: PortableTextBlock) =>
        (block as { children?: Array<{ _type?: string; text?: string }> })?.children
          ?.filter((c) => c._type === "span")
          .map((s) => s.text ?? "")
          .join("") ?? ""
    )
    .join("\n")
    .trim();
}

type ProjectImage = {
  project: Project;
  image: NonNullable<Project["slideshowImages"]>[number];
  imageIndex: number;
  totalImages: number;
};

export type ProjectsGridOverlay = {
  projectId: string;
  startIndex: number;
  projectTitle: string;
  totalSlides: number;
} | null;

type ProjectsGridProps = {
  projects: Project[];
  overlay?: ProjectsGridOverlay;
  overlaySlideIndex?: number;
  onOpenOverlay?: (
    projectId: string,
    startIndex: number,
    projectTitle: string,
    totalSlides: number
  ) => void;
  onCloseOverlay?: () => void;
  onOverlaySlideChange?: (index: number) => void;
  onOverlayPrevClick?: () => void;
  onOverlayNextClick?: () => void;
};

function flattenProjectImages(projects: Project[]): ProjectImage[] {
  return projects.flatMap((project) => {
    const images = project.slideshowImages ?? [];
    return images.map((image, imageIndex) => ({
      project,
      image,
      imageIndex,
      totalImages: images.length,
    }));
  });
}

function getInitialVisibleIndices(items: ProjectImage[]): Set<number> {
  const set = new Set<number>();
  items.forEach((item, index) => {
    if (item.image?.startVisible) set.add(index);
  });
  return set;
}

/** Map a project's slideshow images to SlideshowItem[] */
function projectToSlideshowItems(project: Project): SlideshowItem[] {
  const titlePlain = projectTitleToPlainText(project.title);
  return (project.slideshowImages ?? []).map((img) => ({
    title: img.alt ?? titlePlain,
    image: img?.asset ? { asset: img.asset, alt: img.alt } : undefined,
  }));
}

export default function ProjectsGrid({
  projects,
  overlay: controlledOverlay,
  overlaySlideIndex: controlledSlideIndex = 0,
  onOpenOverlay,
  onCloseOverlay,
  onOverlaySlideChange,
  onOverlayPrevClick,
  onOverlayNextClick,
}: ProjectsGridProps) {
  const items = useMemo(() => flattenProjectImages(projects), [projects]);
  const [visibleImages, setVisibleImages] = useState<Set<number>>(() =>
    getInitialVisibleIndices(items)
  );
  const [internalOverlay, setInternalOverlay] = useState<{
    projectId: string;
    startIndex: number;
  } | null>(null);
  const [internalSlideIndex, setInternalSlideIndex] = useState(0);

  const isControlled = controlledOverlay !== undefined;
  const overlay = isControlled
    ? controlledOverlay
      ? {
          projectId: controlledOverlay.projectId,
          startIndex: controlledOverlay.startIndex,
        }
      : null
    : internalOverlay;
  const overlaySlideIndex = isControlled ? controlledSlideIndex : internalSlideIndex;

  const openProject = useCallback(
    (projectId: string, startIndex: number, project?: Project, totalImages?: number) => {
      const title = project ? projectTitleToPlainText(project.title) || "Untitled" : "Untitled";
      const total = totalImages ?? 0;
      if (onOpenOverlay) {
        onOpenOverlay(projectId, startIndex, title, total);
      } else {
        setInternalOverlay({ projectId, startIndex });
        setInternalSlideIndex(startIndex);
      }
    },
    [onOpenOverlay]
  );
  const closeOverlay = useCallback(() => {
    onCloseOverlay?.();
    if (!isControlled) setInternalOverlay(null);
  }, [onCloseOverlay, isControlled]);
  const handleOverlaySlideChange = useCallback(
    (index: number) => {
      onOverlaySlideChange?.(index);
      if (!isControlled) setInternalSlideIndex(index);
    },
    [onOverlaySlideChange, isControlled]
  );

  const toggleCell = useCallback((index: number) => {
    setVisibleImages((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const overlayProject =
    overlay != null ? projects.find((p) => p._id === overlay.projectId) : null;
  const overlayItems = overlayProject ? projectToSlideshowItems(overlayProject) : [];

  return (
    <>
    <div className="grid w-full grid-cols-10 gap-[15px]">
      {/* First two cells left empty */}
      <div
        className="relative aspect-[4/5] w-full overflow-hidden bg-[#ffffff] transition-opacity duration-200"
        style={{ opacity: overlay ? 0.3 : 1 }}
        aria-hidden
      >
        <div className="cell-content-fade-in h-full w-full" style={{ animationDelay: "0s" }} />
      </div>
      <div
        className="relative aspect-[4/5] w-full overflow-hidden bg-[#ffffff] transition-opacity duration-200"
        style={{ opacity: overlay ? 0.2 : 1 }}
        aria-hidden
      >
        <div className="cell-content-fade-in h-full w-full" style={{ animationDelay: "0.03s" }} />
      </div>
      {items.map(({ project, image, imageIndex, totalImages }, index) => {
        const isOverlayProjectCell =
          overlay != null && overlay.projectId === project._id;
        const isCurrentOverlaySlide =
          isOverlayProjectCell && overlaySlideIndex === imageIndex;
        const showImage = visibleImages.has(index) || isOverlayProjectCell;
        const imageSource = image?.asset ? { asset: image.asset, alt: image.alt } : null;
        const cellIndex = index + 2;

        const isOverlayProject = overlay?.projectId === project._id;
        const cellOpacity = overlay == null ? 1 : isOverlayProject ? 1 : 0.2;

        return (
          <div
            key={`${project._id}-${index}-${image?.asset?._ref ?? "n"}`}
            className="relative aspect-[4/5] w-full overflow-hidden bg-[#ffffff] transition-opacity duration-200"
            style={{ opacity: cellOpacity }}
            onMouseEnter={() => toggleCell(index)}
            onClick={() => openProject(project._id, imageIndex, project, totalImages)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openProject(project._id, imageIndex, project, totalImages);
              }
            }}
            aria-label={`View project ${projectTitleToPlainText(project.title) || "Untitled"}, image ${imageIndex + 1} of ${totalImages}`}
          >
            {/* Active cell indicator: 2px bar on top, above image (no layout shift) */}
            {isCurrentOverlaySlide && (
              <div
                className="absolute left-0 right-0 top-0 z-20 h-[3px] bg-[var(--identity-color)]"
                aria-hidden
              />
            )}
            <div
              className="cell-content-fade-in absolute inset-0"
              style={{ animationDelay: `${cellIndex * 0.03}s` }}
              aria-hidden
            >
            {/* Order, title, and image count: visible when image is not active, bodycopy left/top */}
            <div
              className={`bodycopy relative z-10 flex flex-col gap-0 p-0 text-left align-top ${
                showImage ? "opacity-0 pointer-events-none" : ""
              }`}
            >
              <span>{project.order != null ? project.order : "—"}</span>
              <div>
                {Array.isArray(project.title) && project.title.length > 0 ? (
                  <PortableText content={project.title} />
                ) : (
                  projectTitleToPlainText(project.title) || "Untitled"
                )}
              </div>
              <span>
                {imageIndex + 1}/{totalImages}
              </span>
            </div>
            {/* Image: visible when toggled on, full width and auto height from image aspect ratio */}
            {imageSource && (
              <div
                className={`absolute inset-x-0 top-0 flex justify-center transition-opacity duration-150 ${
                  showImage ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <img
                  src={urlForImage(imageSource).width(1200).url()}
                  alt={image.alt ?? projectTitleToPlainText(project.title) ?? "Project image"}
                  className="h-auto w-full max-w-full object-top"
                />
              </div>
            )}
            </div>
          </div>
        );
      })}
    </div>

    {/* Overlay: project slideshow centered, same size as homepage, fade in */}
    {overlay && overlayItems.length > 0 && (
      <div
        className="projects-overlay-fade-in fixed inset-0 z-50 flex items-center justify-center opacity-0"
        onClick={closeOverlay}
        role="dialog"
        aria-modal="true"
        aria-label="Project slideshow"
      >
        <div
          className="flex w-full max-w-[600px] flex-col items-center px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <Slideshow
            items={overlayItems}
            className="w-full max-w-[600px]"
            showPrevNext
            initialSlideIndex={overlay.startIndex}
            imageFit="contain"
            onSlideChange={handleOverlaySlideChange}
            onPrevClick={onOverlayPrevClick}
            onNextClick={onOverlayNextClick}
          />
          <button
            type="button"
            onClick={closeOverlay}
            className="bodycopy mt-4 text-white underline hover:no-underline"
          >
            Close
          </button>
        </div>
      </div>
    )}
    </>
  );
}
