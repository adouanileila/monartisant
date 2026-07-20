import { ClientSidebarLayout } from "@/components/client/client-sidebar-layout";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientSidebarLayout>
      {children}
    </ClientSidebarLayout>
  );
}
