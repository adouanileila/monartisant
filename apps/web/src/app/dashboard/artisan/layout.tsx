import { ArtisanSidebarLayout } from "@/components/artisan/artisan-sidebar-layout";

export default function ArtisanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ArtisanSidebarLayout>
      {children}
    </ArtisanSidebarLayout>
  );
}