import type { Metadata } from "next";
import Link from "next/link";

import EastAfricaExplorer from "./EastAfricaExplorer";
import type { EastAfricaCatalog } from "@/lib/east-africa/catalog";
import { loadEastAfricaCatalog } from "@/lib/east-africa/load";

export const metadata: Metadata = {
  title: "East Africa Opportunity Atlas",
  description:
    "Explore evidence-labelled business opportunity signals, commercial hubs, and starting sources for Uganda, Kenya, Tanzania, and Rwanda.",
};

export default async function EastAfricaPage() {
  let catalog: EastAfricaCatalog | null = null;

  try {
    catalog = await loadEastAfricaCatalog();
  } catch (error) {
    console.error("loadEastAfricaCatalog:", error);
  }

  if (catalog) return <EastAfricaExplorer catalog={catalog} />;

  return (
    <main className="min-h-screen bg-brand-cream px-4 py-16 text-brand-forest">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-brand-beige bg-brand-surface p-7 text-center shadow-sm sm:p-10">
        <p className="text-4xl" aria-hidden>
          🧭
        </p>
        <h1 className="mt-4 text-2xl font-black">
          The regional research catalog is temporarily unavailable.
        </h1>
        <p className="mt-3 text-sm leading-6 text-brand-green">
          Uganda services are still available from the apps hub.
        </p>
        <Link
          href="/apps"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-brand-forest px-5 text-sm font-black text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
        >
          Back to all apps
        </Link>
      </div>
    </main>
  );
}
