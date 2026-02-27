import { defineField, defineType } from "sanity";

/** Extract plain text from title (string or portable text blocks) for slug and preview */
function titleToPlainText(title: unknown): string {
  if (typeof title === "string") return title;
  if (!Array.isArray(title)) return "";
  return title
    .map(
      (block: { children?: Array<{ _type?: string; text?: string }> }) =>
        block?.children
          ?.filter((c) => c._type === "span")
          .map((s) => s.text ?? "")
          .join("") ?? ""
    )
    .join("\n")
    .trim();
}

export default defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "array",
      description: "Project title with formatting and line breaks.",
      of: [
        {
          type: "block",
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
              { title: "Underline", value: "underline" },
              { title: "Strike", value: "strike" },
            ],
            annotations: [
              {
                title: "Link",
                name: "link",
                type: "object",
                fields: [
                  {
                    title: "URL",
                    name: "href",
                    type: "url",
                    validation: (Rule: { uri: (opts: object) => object }) =>
                      Rule.uri({
                        allowRelative: true,
                        scheme: ["http", "https", "mailto", "tel"],
                      }),
                  },
                  {
                    title: "Open in new tab",
                    name: "blank",
                    type: "boolean",
                    initialValue: false,
                  },
                ],
              },
            ],
          },
        },
      ],
      validation: (Rule) =>
        Rule.required().custom((value) => {
          const text = titleToPlainText(value);
          return text.length > 0 || "Title must have some text (for slug and display).";
        }),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: (doc: { title?: unknown }) => titleToPlainText(doc?.title),
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Numbered order for display (e.g. 1, 2, 3...). Lower numbers appear first.",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "slideshowImages",
      title: "Slideshow images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              title: "Alt Text",
              type: "string",
            },
            {
              name: "startVisible",
              title: "Start visible",
              type: "boolean",
              description:
                "When on, this image shows (mouse-enter state) when the page first loads.",
              initialValue: false,
            },
          ],
        },
        {
          type: "object",
          name: "video",
          title: "Video",
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
            {
              name: "startVisible",
              title: "Start visible",
              type: "boolean",
              description:
                "When on, this video shows (mouse-enter state) when the page first loads.",
              initialValue: false,
            },
          ],
        },
      ],
    }),
  ],
  orderings: [
    {
      title: "Order (ascending)",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
    {
      title: "Order (descending)",
      name: "orderDesc",
      by: [{ field: "order", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", order: "order" },
    prepare({ title, order }) {
      const text = titleToPlainText(title);
      return {
        title: text || "Untitled project",
        subtitle: order != null ? `Order: ${order}` : undefined,
      };
    },
  },
});
