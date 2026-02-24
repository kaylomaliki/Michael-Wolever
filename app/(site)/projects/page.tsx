import { getProjects } from "@/lib/queries";
import ProjectsPageClient from "./ProjectsPageClient";

/**
 * Projects page: nav + grid; in slideshow overlay mode nav shows project title, counter, and hover state like homepage.
 */
export const revalidate = 60;

export default async function ProjectsPage() {
  const projects = await getProjects();

  return <ProjectsPageClient projects={projects} />;
}
