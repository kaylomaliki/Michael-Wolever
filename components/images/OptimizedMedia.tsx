"use client";

import { useMemo, useRef, useEffect } from "react";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import OptimizedImage, { OptimizedImageProps } from "./OptimizedImage";
import MuxPlayer from "@mux/mux-player-react";
import { urlForImage } from "@/lib/image";

/**
 * OptimizedMedia Component
 * 
 * A unified component that handles both images and videos from Sanity.
 * Uses OptimizedImage for images and Mux Player for videos.
 * 
 * Maintains the same props interface as OptimizedImage for consistency.
 */

export type MediaItem = 
  | {
      _type?: "image";
      asset?: {
        _ref?: string;
        _type?: "reference";
        _id?: string;
      };
      alt?: string;
    }
  | {
      _type: "video";
      videoType?: "mux" | "file";
      muxPlaybackId?: string;
      videoFile?: {
        asset?: {
          _ref?: string;
          _type?: "reference";
          url?: string;
          originalFilename?: string;
        };
      };
      poster?: {
        asset?: {
          _ref?: string;
          _type?: "reference";
          _id?: string;
        };
        alt?: string;
      };
      alt?: string;
      autoplay?: boolean;
      loop?: boolean;
      muted?: boolean;
      controls?: boolean;
    };

export interface OptimizedMediaProps extends Omit<OptimizedImageProps, "image" | "alt"> {
  /** Media item (image or video) from Sanity */
  media: MediaItem;
  
  /** Alt text (optional, will use media.alt if not provided) */
  alt?: string;
  
  /** Whether the media is currently in view (for video playback control) */
  isInView?: boolean;
}

/**
 * Check if a media item is a video
 * If _type is "video", or _type is missing/null but has video fields, treat as video
 */
function isVideo(media: MediaItem): media is Extract<MediaItem, { _type: "video" }> {
  if (media._type === "video") return true;
  const m = media as { _type?: string; videoType?: string; muxPlaybackId?: string; videoFile?: { asset?: unknown } };
  if (m.videoType === "mux" && m.muxPlaybackId) return true;
  if (m.videoType === "file" && m.videoFile?.asset) return true;
  return false;
}

/**
 * Get video source URL
 */
function getVideoSource(media: Extract<MediaItem, { _type: "video" }>): string | null {
  if (media.videoType === "mux" && media.muxPlaybackId) {
    return media.muxPlaybackId;
  }
  
  if (media.videoType === "file") {
    // For file uploads, we need to construct the URL from the asset reference
    // Sanity file assets have a URL structure: https://cdn.sanity.io/files/{projectId}/{dataset}/{filename}
    if (media.videoFile?.asset?.url) {
      return media.videoFile.asset.url;
    }
    // If we have a _ref, we might need to construct the URL
    if (media.videoFile?.asset?._ref) {
      // Sanity file URL format: https://cdn.sanity.io/files/{projectId}/{dataset}/{fileId}.{extension}
      const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
      const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
      const ref = media.videoFile.asset._ref;
      // Extract file ID and extension from ref (format: "file-{id}-{extension}")
      const match = ref.match(/^file-([^-]+)-([^.]+)\.(.+)$/);
      if (match && projectId) {
        const [, fileId, , extension] = match;
        return `https://cdn.sanity.io/files/${projectId}/${dataset}/${fileId}.${extension}`;
      }
    }
  }
  
  return null;
}

export default function OptimizedMedia({
  media,
  alt,
  fill = false,
  width,
  height,
  className,
  sizes,
  objectFit = "cover",
  objectPosition,
  quality,
  priority,
  isInView = true,
  ...props
}: OptimizedMediaProps) {
  // Determine if this is a video - early check for performance
  // If _type is undefined or not "video", treat as image
  const isVideoItem = isVideo(media);
  
  // Get alt text
  const altText = alt || media.alt || "";

  // Get poster image URL if available (only used for videos, but must be defined before early return)
  const posterUrl = useMemo(() => {
    if (!isVideoItem) return undefined;
    const videoMedia = media as Extract<MediaItem, { _type: "video" }>;
    if (!videoMedia.poster?.asset) return undefined;
    try {
      return urlForImage(videoMedia.poster as SanityImageSource)
        .width(1920)
        .quality(90)
        .url();
    } catch {
      return undefined;
    }
  }, [isVideoItem, media]);
  
  // Container styles for videos: fill mode uses 100% size; fixed mode uses width/height for same sizing as images
  const containerStyle = useMemo((): React.CSSProperties | undefined => {
    if (!isVideoItem) return undefined;
    if (fill) {
      return {
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      };
    }
    if (width != null && height != null) {
      return {
        position: "relative",
        width,
        height,
        maxWidth: "100%",
        overflow: "hidden",
      };
    }
    return undefined;
  }, [isVideoItem, fill, width, height]);
  
  // Video player styles (only used for videos, but must be defined before early return)
  const playerStyle = useMemo(() => {
    if (!isVideoItem) return undefined;
    const style: React.CSSProperties = {
      width: "100%",
      height: "100%",
    };
    
    if (objectFit) {
      style.objectFit = objectFit;
    }
    
    if (objectPosition) {
      style.objectPosition = objectPosition;
    }
    
    return style;
  }, [isVideoItem, objectFit, objectPosition]);
  
  // Refs for video elements (must be defined before early return)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const muxPlayerRef = useRef<any>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  
  // Determine all video control settings with proper defaults
  // Only use defaults if the value is undefined (not explicitly set in Sanity)
  const showControls = isVideoItem ? (media.controls !== undefined ? media.controls : true) : true;
  const shouldAutoplay = isVideoItem ? (media.autoplay !== undefined ? media.autoplay : false) : false;
  const shouldLoop = isVideoItem ? (media.loop !== undefined ? media.loop : false) : false;
  const shouldMute = isVideoItem ? (media.muted !== undefined ? media.muted : true) : true;
  
  // Only autoplay if in view
  const effectiveAutoplay = shouldAutoplay && isInView;
  
  // Control video playback based on isInView (only runs for videos)
  useEffect(() => {
    if (!isVideoItem) return;
    const videoMedia = media as Extract<MediaItem, { _type: "video" }>;
    const videoType = videoMedia.videoType;
    
    if (isInView) {
      // Video is in view - play it
      if (videoType === "mux" && muxPlayerRef.current) {
        // Mux Player
        const player = muxPlayerRef.current as { play?: () => Promise<void> };
        if (player.play) {
          player.play().catch(() => {
            // Autoplay might be blocked, that's okay
          });
        }
      } else if (videoElementRef.current) {
        // HTML5 video
        const video = videoElementRef.current;
        video.currentTime = 0; // Reset to start
        video.play().catch(() => {
          // Autoplay might be blocked, that's okay
        });
      }
    } else {
      // Video is out of view - pause and reset
      if (videoType === "mux" && muxPlayerRef.current) {
        // Mux Player
        const player = muxPlayerRef.current as { pause?: () => void; currentTime?: number };
        if (player.pause) {
          player.pause();
        }
        if (player.currentTime !== undefined) {
          player.currentTime = 0;
        }
      } else if (videoElementRef.current) {
        // HTML5 video
        const video = videoElementRef.current;
        video.pause();
        video.currentTime = 0;
      }
    }
  }, [isVideoItem, isInView, media]);
  
  // Merge player style with controls CSS variable
  const finalPlayerStyle = useMemo(() => {
    if (!isVideoItem || !playerStyle) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const style: any = { ...playerStyle };
    if (!showControls) {
      // Use CSS custom property to hide controls (Mux Player supports this)
      style['--controls'] = 'none';
    }
    return style;
  }, [isVideoItem, playerStyle, showControls]);
  
  // EARLY RETURN for images - avoid all video-related processing
  if (!isVideoItem) {
    // Ensure we have an asset for images
    if (!media.asset) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("OptimizedMedia: Image media item missing asset", media);
      }
      return null;
    }
    
    // Direct passthrough to OptimizedImage - no overhead
    return (
      <OptimizedImage
        image={media as SanityImageSource}
        alt={altText}
        fill={fill}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
        objectFit={objectFit}
        objectPosition={objectPosition}
        quality={quality}
        priority={priority}
        {...props}
      />
    );
  }
  
  // It's a video - process video-specific logic
  const videoMedia = media as Extract<MediaItem, { _type: "video" }>;
  const videoSource = getVideoSource(videoMedia);
  
  if (!videoSource) {
    console.warn("OptimizedMedia: Invalid video source, missing playback ID or file URL");
    return null;
  }
  
  // Mux Player props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const muxPlayerProps: any = {
    poster: posterUrl,
    autoPlay: effectiveAutoplay,
    loop: shouldLoop,
    muted: shouldMute,
    style: finalPlayerStyle,
    envKey: process.env.NEXT_PUBLIC_MUX_ENV_KEY,
    // Controls prop - if it doesn't work, CSS custom property will handle it
    controls: showControls,
  };
  
  // Render video with Mux Player
  if (videoMedia.videoType === "mux") {
    return (
      <div style={containerStyle} className={className}>
        <MuxPlayer
          ref={muxPlayerRef}
          playbackId={videoSource}
          streamType="on-demand"
          metadata={{
            video_title: altText || "Video",
          }}
          {...muxPlayerProps}
        />
      </div>
    );
  }
  
  // Render video from file upload - use native HTML5 video element
  // MuxPlayer doesn't work well with direct video URLs, so we use a regular video element
  return (
    <div style={containerStyle} className={className}>
      <video
        ref={videoElementRef}
        src={videoSource || undefined}
        poster={posterUrl}
        autoPlay={effectiveAutoplay}
        loop={shouldLoop}
        muted={shouldMute}
        controls={showControls}
        playsInline
        style={finalPlayerStyle}
        className="w-full h-full"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

