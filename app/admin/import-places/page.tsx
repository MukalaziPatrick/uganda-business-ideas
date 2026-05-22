import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ImportPlacesClient from "./ImportPlacesClient";

export default async function ImportPlacesPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== process.env.ADMIN_SECRET) {
    redirect("/admin/login");
  }
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-black text-[#1C3A2A] mb-1">Import Places</h1>
      <p className="text-sm text-gray-500 mb-6">
        Upload a JSON file from the Python scraper. Review the preview, then click Import.
      </p>
      <ImportPlacesClient />
    </main>
  );
}
