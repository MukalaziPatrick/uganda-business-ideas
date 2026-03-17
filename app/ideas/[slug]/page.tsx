import { ideas } from "../../data/ideas";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const idea = ideas.find((item) => item.slug === slug);

  if (!idea) {
    return {
      title: "Business Idea Not Found",
      description: "The requested business idea could not be found.",
    };
  }

  return {
    title: `${idea.title} in Uganda`,
    description: `${idea.desc} Startup capital: ${idea.capital}. Skills needed: ${idea.skills}.`,
  };
}

export default async function IdeaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const idea = ideas.find((item) => item.slug === slug);

  if (!idea) {
    notFound();
  }

  return (
    <main className="p-6">
        <Link href="/" className="text-blue-600 underline">
  ← Back to all ideas
</Link>
      <h1 className="text-3xl font-bold">{idea.title}</h1>
      <p className="mt-4 text-lg">{idea.desc}</p>

      <div className="mt-6 space-y-4">
        <div className="border p-4 rounded">
          <h2 className="font-semibold">Startup Capital</h2>
          <p>{idea.capital}</p>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold">Skills Needed</h2>
          <p>{idea.skills}</p>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold">Risks</h2>
          <p>{idea.risks}</p>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold">Profit Potential</h2>
          <p>{idea.profit}</p>
        </div>
      </div>
    </main>
  );
}