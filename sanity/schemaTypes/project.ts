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
              description: "When on, this image shows (mouse-enter state) when the page first loads.",
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
