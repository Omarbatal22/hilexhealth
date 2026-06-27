import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";

/**
 * Marketing chrome — sticky navbar over the content and the closing footer.
 * Shared by the landing page, doctor search/profile, and the AI assistant.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
