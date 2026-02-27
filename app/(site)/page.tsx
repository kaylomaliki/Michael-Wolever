import HomePageContent from "@/components/layout/HomePageContent";
import { getHomepage } from "@/lib/queries";

/**
 * Homepage
 *
 * Fetches the single "Homepage" document from Sanity (slideshow items only).
 * Create a "Homepage" document in Sanity Studio and add slideshow items.
 */
export const revalidate = 60;

export default async function Home() {
  const homepage = await getHomepage();
  const items = homepage?.items ?? [];

  return (
    <main className="relative flex min-h-screen items-center justify-center p-8">
      {items.length > 0 ? (
        <HomePageContent items={items} />
      ) : null}
    </main>
  );
}

