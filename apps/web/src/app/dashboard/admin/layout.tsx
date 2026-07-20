import { AdminSidebarLayout } from "@/components/admin/admin-sidebar-layout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminSidebarLayout>
      {children}
    </AdminSidebarLayout>
  );
}
