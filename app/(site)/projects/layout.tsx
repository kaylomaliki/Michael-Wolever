/**
 * Projects layout for /projects
 */
export const revalidate = 60;

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen w-full p-[20px]">
      {children}
    </main>
  );
}
