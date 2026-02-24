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
          ],
          preview: {
            select: { title: "title", media: "image" },
            prepare({ title, media }) {
              return { title: title || "Slide", media };
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
