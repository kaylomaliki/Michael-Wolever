import { sanityClient } from "./sanity.client";
import type { PortableTextBlock } from "@portabletext/types";

/**
 * TypeScript types for Sanity content
 * These match the schema definitions in sanity/schemaTypes/
 */

export interface GlobalSettings {
  _id: string;
  siteTitle?: string;
  siteDescription?: string;
  defaultOgImage?: {
    asset: {
      _ref: string;
      _type: "reference";
    };
  };
}

/** Single slideshow item from homepage (title + image only) */
export interface HomepageSlideshowItem {
  title?: string;
  image?: {
    asset?: { _ref: string; _type: "reference" };
    alt?: string;
  };
  video?: {
    _type?: "video";
    videoType?: "mux" | "file";
    muxPlaybackId?: string;
    videoFile?: {
      asset?: {
        _ref?: string;
        _type?: string;
        url?: string;
        originalFilename?: string;
      };
    };
    poster?: {
      asset?: { _ref?: string; _type?: string; _id?: string };
      alt?: string;
    };
    alt?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
  };
}

/** Homepage document: slideshow items only */
export interface Homepage {
  _id: string;
  items?: HomepageSlideshowItem[];
}

export interface Page {
  _id: string;
  title?: string;
  slug?: {
    current: string;
  };
  description?: string;
  content?: PortableTextBlock[]; // Portable text content (array of blocks)
}

export interface Post {
  _id: string;
  title?: string;
  slug?: {
    current: string;
  };
  description?: string;
  content?: PortableTextBlock[]; // Portable text content (array of blocks)
  featuredImage?: {
    asset: {
      _ref: string;
      _type: "reference";
    };
  };
  publishedAt?: string;
}

/** Project document for the projects page grid */
export interface Project {
  _id: string;
  /** Title as portable text (blocks) or legacy string */
  title?: PortableTextBlock[] | string;
  slug?: { current: string };
  order?: number;
  slideshowImages?: Array<
    | {
        _type?: "image";
        asset?: { _ref: string; _type?: string };
        alt?: string;
        startVisible?: boolean;
      }
    | {
        _type: "video";
        videoType?: "mux" | "file";
        muxPlaybackId?: string;
        videoFile?: {
          asset?: {
            _ref?: string;
            _type?: string;
            url?: string;
            originalFilename?: string;
          };
        };
        poster?: {
          asset?: { _ref?: string; _type?: string; _id?: string };
          alt?: string;
        };
        alt?: string;
        autoplay?: boolean;
        loop?: boolean;
        muted?: boolean;
        controls?: boolean;
        startVisible?: boolean;
      }
  >;
}

/**
 * Sanity Data Queries
 * 
 * These functions fetch data from your Sanity CMS.
 * Customize queries based on your schema types.
 */

/**
 * Fetch global site settings
 * Create a document of type "globalSettings" in Sanity Studio
 */
export async function getGlobalSettings(): Promise<GlobalSettings | null> {
  try {
    const query = `*[_type == "globalSettings"][0]`;
    return await sanityClient.fetch<GlobalSettings | null>(query);
  } catch (error) {
    console.error("Error fetching global settings:", error);
    return null;
  }
}

/**
 * Fetch homepage (slideshow items only)
 * Create a single "Homepage" document in Sanity Studio
 */
export async function getHomepage(): Promise<Homepage | null> {
  try {
    const query = `*[_type == "homepage"][0]{
      _id,
      items[]{
        title,
        image{
          asset,
          alt
        },
        video{
          _type,
          videoType,
          muxPlaybackId,
          videoFile{
            asset->{
              _ref,
              _type,
              url,
              originalFilename
            }
          },
          poster{
            asset,
            alt
          },
          alt,
          autoplay,
          loop,
          muted,
          controls
        }
      }
    }`;
    return await sanityClient.fetch<Homepage | null>(query);
  } catch (error) {
    console.error("Error fetching homepage:", error);
    return null;
  }
}

/**
 * Fetch all projects ordered by the order field (ascending)
 */
export async function getProjects(): Promise<Project[]> {
  try {
    const query = `*[_type == "project"] | order(order asc) {
      _id,
      title,
      slug,
      order,
      slideshowImages[]{
        _type,
        asset,
        alt,
        startVisible,
        videoType,
        muxPlaybackId,
        videoFile{
          asset->{
            _ref,
            _type,
            url,
            originalFilename
          }
        },
        poster{
          asset,
          alt
        },
        autoplay,
        loop,
        muted,
        controls
      }
    }`;
    return await sanityClient.fetch<Project[]>(query);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

/**
 * Fetch a single project by slug
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const query = `*[_type == "project" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      order,
      slideshowImages[]{
        _type,
        asset,
        alt,
        startVisible,
        videoType,
        muxPlaybackId,
        videoFile{
          asset->{
            _ref,
            _type,
            url,
            originalFilename
          }
        },
        poster{
          asset,
          alt
        },
        autoplay,
        loop,
        muted,
        controls
      }
    }`;
    return await sanityClient.fetch<Project | null>(query, { slug });
  } catch (error) {
    console.error(`Error fetching project with slug "${slug}":`, error);
    return null;
  }
}

/**
 * Fetch a page by slug (static pages only; homepage uses getHomepage)
 */
export async function getPageBySlug(slug: string): Promise<Page | null> {
  try {
    const query = `*[_type == "page" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      description,
      content
    }`;
    return await sanityClient.fetch<Page | null>(query, { slug });
  } catch (error) {
    console.error(`Error fetching page with slug "${slug}":`, error);
    return null;
  }
}

/**
 * Fetch all posts
 * Useful for blog listings, archives, etc.
 */
export async function getAllPosts(): Promise<Post[]> {
  try {
    const query = `*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      description,
      featuredImage,
      publishedAt
    }`;
    return await sanityClient.fetch<Post[]>(query);
  } catch (error) {
    console.error("Error fetching all posts:", error);
    return [];
  }
}

/**
 * Fetch a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const query = `*[_type == "post" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      description,
      content,
      featuredImage,
      publishedAt
    }`;
    return await sanityClient.fetch<Post | null>(query, { slug });
  } catch (error) {
    console.error(`Error fetching post with slug "${slug}":`, error);
    return null;
  }
}
