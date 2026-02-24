"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

type NavProps = {
  /** Title of the current slideshow image (e.g. from homepage carousel) */
  currentSlideTitle?: string;
  /** Current slide index (0-based) for counter */
  currentSlideIndex?: number;
  /** Total number of slides for counter */
  totalSlides?: number;
  /** When "hover", default shows name + slide info; hover shows name + Projects + Information. When "projects"/"information", default shows that label + close icon (link to home). */
  variant?: "default" | "hover" | "projects" | "information";
  /** Last navigation direction for the slideshow (shows arrow flash in default/non-hover view) */
  lastDirection?: "left" | "right" | null;
  /** Increments when direction changes so the flash animation re-runs */
  directionChangeKey?: number;
};

const INITIAL_BG_DURATION_MS = 3000; /* 2s visible + 1s fade */

const ARROW_LEFT = "⏴";
const ARROW_RIGHT = "⏵";

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function Nav({
  currentSlideTitle,
  currentSlideIndex = 0,
  totalSlides = 0,
  variant = "default",
  lastDirection = null,
  directionChangeKey = 0,
}: NavProps) {
  const isHoverVariant = variant === "hover";
  const isProjectsVariant = variant === "projects";
  const isInformationVariant = variant === "information";
  const isDetailVariant = isProjectsVariant || isInformationVariant;
  const [showInitialBg, setShowInitialBg] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowInitialBg(false), INITIAL_BG_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <nav className="group relative w-fit p-0">
      {/* Background: visible 2s on load then fades out 1s; on hover appears instantly, on leave fades out 1s */}
      <div
        className={`absolute inset-0 bg-[#ffffff] opacity-0 transition-opacity duration-[0s] group-hover:opacity-100 group-hover:duration-0 ${showInitialBg ? "nav-bg-initial" : ""}`}
        aria-hidden
      />
      {/* Direction arrows: only for hover variant (slideshow); hidden on projects/information page */}
      {!isDetailVariant && (
      <div
        className={`absolute left-0 top-0 z-20 flex gap-[5px] pl-[100px] bodycopy ${isHoverVariant ? "opacity-100 group-hover:opacity-0 group-hover:transition-opacity group-hover:duration-150" : ""}`}
        aria-hidden
      >
        <span
          key={lastDirection === "left" ? `left-${directionChangeKey}` : "left"}
          className={lastDirection === "left" ? "nav-arrow-flash opacity-0" : "opacity-0"}
        >
          {ARROW_LEFT}
        </span>
        <span
          key={lastDirection === "right" ? `right-${directionChangeKey}` : "right"}
          className={lastDirection === "right" ? "nav-arrow-flash opacity-0" : "opacity-0"}
        >
          {ARROW_RIGHT}
        </span>
      </div>
      )}
      <div className="relative z-10">
      {isProjectsVariant ? (
        <>
          {/* Projects variant: Michael Wolever + Projects with X + Information on hover */}
          <span className="bodycopy block w-full pl-[0px] pr-[40px] text-left align-top text-[var(--identity-color)]">
            Michael Wolever
          </span>
          <Link
            href="/"
            className="bodycopy flex w-full items-center gap-1.5 text-left text-inherit no-underline hover:underline"
          >
            <span>Projects</span>
            <CloseIcon className="h-[1em] w-[1em] shrink-0" />
          </Link>
          {/* Invisible spacer matching one line of bodycopy height; only in persistent state */}
          <span className="bodycopy block h-[1.1em] w-full group-hover:hidden" aria-hidden />
          <Link
            href="/information"
            className="bodycopy hidden w-full text-left text-inherit no-underline hover:underline group-hover:block"
          >
            Information
          </Link>
        </>
      ) : isInformationVariant ? (
        <>
          {/* Information variant: Michael Wolever + Information with X + Projects on hover */}
          <span className="bodycopy block w-full pl-[0px] pr-[40px] text-left align-top text-[var(--identity-color)]">
            Michael Wolever
          </span>
          <Link
            href="/"
            className="bodycopy flex w-full items-center gap-1.5 text-left text-inherit no-underline hover:underline"
          >
            <span>Information</span>
            <CloseIcon className="h-[1em] w-[1em] shrink-0" />
          </Link>
          {/* Invisible spacer matching one line of bodycopy height; only in persistent state */}
          <span className="bodycopy block h-[1.1em] w-full group-hover:hidden" aria-hidden />
          <Link
            href="/projects"
            className="bodycopy hidden w-full text-left text-inherit no-underline hover:underline group-hover:block"
          >
            Projects
          </Link>
        </>
      ) : isHoverVariant ? (
        <>
          {/* Default: Michael Wolever + slide title + counter */}
          <div className="group-hover:hidden">
            <span className="bodycopy block w-full pl-[0px] pr-[40px] text-left align-top text-[var(--identity-color)]">
              Michael Wolever
            </span>
            {currentSlideTitle != null && currentSlideTitle !== "" && (
              <p className="bodycopy block w-full text-left">
                {currentSlideTitle}
              </p>
            )}
            {totalSlides > 0 && (
              <p className="bodycopy block w-full text-left">
                {currentSlideIndex + 1}/{totalSlides}
              </p>
            )}
          </div>
          {/* Hover: Michael Wolever + Projects + Information */}
          <div className="hidden group-hover:block">
            <span className="bodycopy block w-full pl-[0px] pr-[40px] text-left align-top text-[var(--identity-color)]">
              Michael Wolever
            </span>
            <Link
              href="/projects"
              className="bodycopy block w-full text-left text-inherit no-underline hover:underline"
            >
              Projects
            </Link>
            <Link
              href="/information"
              className="bodycopy block w-full text-left text-inherit no-underline hover:underline"
            >
              Information
            </Link>
          </div>
        </>
      ) : (
        <>
          <span className="bodycopy block w-full pl-[0px] text-left align-top text-[var(--identity-color)]">
            Michael Wolever
          </span>
          {currentSlideTitle != null && currentSlideTitle !== "" && (
            <p className="bodycopy block w-full text-left">
              {currentSlideTitle}
            </p>
          )}
          {totalSlides > 0 && (
            <p className="bodycopy block w-full text-left">
              {currentSlideIndex + 1}/{totalSlides}
            </p>
          )}
        </>
      )}
      </div>
    </nav>
  );
}
