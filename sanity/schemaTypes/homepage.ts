import { defineField, defineType } from "sanity";

export default defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "items",
      title: "Slideshow items",
      type: "array",
      description: "Images for the homepage slideshow. Each item has a title and image.",
      of: [
        {
          type: "object",
          name: "slideshowItem",
          title: "Slideshow item",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
            },
            {
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              fields: [
                {
                  name: "alt",
                  title: "Alt Text",
                  type: "string",
                  description: "Important for accessibility and SEO.",
                },
              ],
            },
            {
              name: "video",
              title: "Video",
              type: "object",
              description:
                "Optional video for this slide. If provided, it will be used instead of the image.",
              fields: [
                {
                  name: "videoType",
                  title: "Video Source",
                  type: "string",
                  options: {
                    list: [
                      { title: "Mux Playback ID", value: "mux" },
                      { title: "File Upload", value: "file" },
                    ],
                    layout: "radio",
                  },
                  initialValue: "mux",
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: "muxPlaybackId",
                  title: "Mux Playback ID",
                  type: "string",
                  description: "The playback ID from Mux (e.g., abc123xyz)",
                  hidden: ({ parent }) => parent?.videoType !== "mux",
                  validation: (Rule) =>
                    Rule.custom((value, context) => {
                      const parent = context.parent as { videoType?: string };
                      if (parent?.videoType === "mux" && !value) {
                        return "Mux Playback ID is required when using Mux video source";
                      }
                      return true;
                    }),
                },
                {
                  name: "videoFile",
                  title: "Video File",
                  type: "file",
                  description: "Upload a video file",
                  hidden: ({ parent }) => parent?.videoType !== "file",
                  options: {
                    accept: "video/*",
                  },
                  validation: (Rule) =>
                    Rule.custom((value, context) => {
                      const parent = context.parent as { videoType?: string };
                      if (parent?.videoType === "file" && !value) {
                        return "Video file is required when using file upload";
                      }
                      return true;
                    }),
                },
                {
                  name: "poster",
                  title: "Poster Image",
                  type: "image",
                  description: "Thumbnail/poster image for the video (optional)",
                  options: {
                    hotspot: true,
                  },
                  fields: [
                    {
                      name: "alt",
                      title: "Alt Text",
                      type: "string",
                    },
                  ],
                },
                {
                  name: "alt",
                  title: "Alt Text / Description",
                  type: "string",
                  description: "Description of the video for accessibility",
                },
                {
                  name: "autoplay",
                  title: "Autoplay",
                  type: "boolean",
                  description: "Automatically play the video when loaded",
                  initialValue: false,
                },
                {
                  name: "loop",
                  title: "Loop",
                  type: "boolean",
                  description: "Loop the video when it ends",
                  initialValue: false,
                },
                {
                  name: "muted",
                  title: "Muted",
                  type: "boolean",
                  description: "Mute the video by default",
                  initialValue: true,
                },
                {
                  name: "controls",
                  title: "Show Controls",
                  type: "boolean",
                  description: "Show video playback controls",
                  initialValue: true,
                },
              ],
            },
          ],
          preview: {
            select: { title: "title", media: "image", videoPoster: "video.poster" },
            prepare({ title, media, videoPoster }) {
              return {
                title: title || "Slide",
                media: videoPoster || media,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      firstTitle: "items.0.title",
      firstMedia: "items.0.image",
    },
    prepare({ firstTitle, firstMedia }) {
      return {
        title: firstTitle || "Homepage",
        media: firstMedia,
      };
    },
  },
});
