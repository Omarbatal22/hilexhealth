import { AppSidebar } from "@/components/app/app-sidebar";

/**
 * Authenticated app shell — persistent sidebar nav instead of the marketing
 * navbar/footer. Used by the patient dashboard and its sub-routes.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-soft-bg lg:flex-row">
      <AppSidebar />
      <div className="flex-1 lg:min-w-0">{children}</div>
    </div>
  );
}
