import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { chargerParametresSite } from "@/lib/parametres-site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const siteParams = await chargerParametresSite();

  return (
    <div className="flex flex-col min-h-screen">
      <Header siteParams={siteParams} />
      <main className="flex-1">{children}</main>
      <Footer siteParams={siteParams} />
    </div>
  );
}
