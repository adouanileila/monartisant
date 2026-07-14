import { ArtisanNavbar } from "@/components/artisan/artisan-navbar";

export default function ArtisanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <ArtisanNavbar />
      <main className="p-6">{children}</main>
    </div>
  );
}