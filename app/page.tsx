"use client";

import { useState } from "react";
import Link from "next/link";
import { ideas } from "./data/ideas";

export default function Home() {
  const [search, setSearch] = useState("");

  const filteredIdeas = ideas.filter((idea) =>
    idea.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">
        Find the Best Business Ideas in Uganda 🇺🇬
      </h1>

      <input
        type="text"
        placeholder="Search business ideas..."
        className="border p-3 mt-4 w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="mt-6 space-y-4">
        {filteredIdeas.map((idea) => (
          <Link key={idea.slug} href={`/ideas/${idea.slug}`}>
            <div className="border p-4 rounded cursor-pointer hover:bg-gray-50">
              <h2 className="font-bold">{idea.title}</h2>
              <p>{idea.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}