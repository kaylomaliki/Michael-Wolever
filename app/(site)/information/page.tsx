import Nav from "@/components/layout/Nav";

/**
 * Information page at /information
 */
export default function InformationPage() {
  return (
    <div className="relative min-h-screen p-[20px]">
      <div className="fixed left-[20px] top-[20px] z-10">
        <Nav variant="information" />
      </div>
    </div>
  );
}
