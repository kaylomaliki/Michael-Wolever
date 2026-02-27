"use client";

import { useCallback, useMemo, useState } from "react";
import PortableText from "@/components/sanity/PortableText";
import OptimizedMedia, { type MediaItem } from "@/components/images/OptimizedMedia";
import MediaSlideshow, {
  type MediaSlideshowItem,
} from "@/components/slideshow/MediaSlideshow";
import type { Project } from "@/lib/queries";
import type { PortableTextBlock } from "@portabletext/types";

/** Normalize a project slideshow item (image or video) to OptimizedMedia's MediaItem, or null */
function toMediaItem(
  item: NonNullable<Project["slideshowImages"]>[number] | null
): MediaItem | null {
  if (!item) return null;
  if (item.asset) return item as MediaItem;
  const v = item as { _type?: string; videoType?: string; videoFile?: { asset?: unknown } };
  if (v.videoType === "mux" && (v as { muxPlaybackId?: string }).muxPlaybackId)
    return { ...item, _type: "video" as const };
  if (v.videoType === "file" && v.videoFile?.asset)
    return { ...item, _type: "video" as const };
  return null;
}

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

/** Map a project's slideshow (images + videos) to MediaSlideshowItem[] for overlay */
function projectToMediaSlideshowItems(project: Project | null): MediaSlideshowItem[] {
  if (!project) return [];
  const titlePlain = projectTitleToPlainText(project.title);
  return (project.slideshowImages ?? []).map((img) => ({
    media: toMediaItem(img),
    alt: (img as { alt?: string }).alt ?? titlePlain ?? "",
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
  const overlayMediaItems = projectToMediaSlideshowItems(overlayProject);

  return (
    <>
    <div className="projects-grid">
      {items.map(({ project, image, imageIndex, totalImages }, index) => {
        const isOverlayProjectCell =
          overlay != null && overlay.projectId === project._id;
        const isCurrentOverlaySlide =
          isOverlayProjectCell && overlaySlideIndex === imageIndex;
        const showImage = visibleImages.has(index) || isOverlayProjectCell;
        const media = toMediaItem(image);
        const cellIndex = index;

        const isOverlayProject = overlay?.projectId === project._id;
        const cellOpacity = overlay == null ? 1 : isOverlayProject ? 1 : 0.05;
        const cellGrayscale = overlay != null && !isOverlayProject;

        return (
          <div
            key={`${project._id}-${index}-${image?.asset?._ref ?? (image as { muxPlaybackId?: string })?.muxPlaybackId ?? "v"}`}
            className={`relative aspect-[4/5] w-full overflow-hidden transition-[opacity,filter] duration-200 ${cellGrayscale ? "grayscale" : ""}`}
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
            {/* Active cell indicator: 5px bar on top, above image (no layout shift) */}
            {isCurrentOverlaySlide && (
              <div
                className="absolute left-0 right-0 top-0 z-20 h-[5px] bg-[var(--identity-color)]"
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
            {/* Media: full width of cell, auto height (top-aligned; cell overflow clips if taller) */}
            {media && (
              <div
                className={`absolute left-0 right-0 top-0 w-full transition-opacity duration-150 ${
                  showImage ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <div className="relative w-full [&>div]:!h-auto [&>div]:!max-w-full [&>div]:!w-full">
                  <OptimizedMedia
                    media={media}
                    alt={
                      (image as { alt?: string }).alt ??
                      projectTitleToPlainText(project.title) ??
                      "Project media"
                    }
                    fill={false}
                    width={800}
                    height={600}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-top w-full h-auto"
                    isInView={showImage}
                  />
                </div>
              </div>
            )}
            </div>
          </div>
        );
      })}
    </div>

    {/* Overlay: MediaSlideshow (same as homepage) with backdrop click to close */}
    {overlay && overlayMediaItems.length > 0 && (
      <div
        className="projects-overlay-fade-in fixed inset-0 z-50 flex items-center justify-center opacity-0"
        onClick={closeOverlay}
        role="dialog"
        aria-modal="true"
        aria-label="Project slideshow"
      >
        <div
          className="flex flex-col items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <MediaSlideshow
            items={overlayMediaItems}
            currentIndex={overlaySlideIndex}
            onPrev={() => {
              const n = overlayMediaItems.length;
              const next = (overlaySlideIndex - 1 + n) % n;
              handleOverlaySlideChange(next);
              onOverlayPrevClick?.();
            }}
            onNext={() => {
              const n = overlayMediaItems.length;
              const next = (overlaySlideIndex + 1) % n;
              handleOverlaySlideChange(next);
              onOverlayNextClick?.();
            }}
            maxHeightClassName="max-h-[600px]"
            width={800}
            stopPropagationOnClick
            mediaProps={{
              sizes: "(max-width: 768px) 100vw, 800px",
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    )}
    </>
  );
}
