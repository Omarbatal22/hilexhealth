import { ProviderSidebar } from "@/components/provider/provider-sidebar";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-soft-bg lg:flex-row">
      <ProviderSidebar />
      <div className="flex-1 lg:min-w-0">{children}</div>
    </div>
  );
}
