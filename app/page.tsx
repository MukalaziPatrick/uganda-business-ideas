// app/page.tsx
import type { Metadata } from "next";
import { ideas } from "./data/ideas";
import HomeClient from "./HomeClient";
import HomeJobsTeaser from "./HomeJobsTeaser";

export const metadata: Metadata = {
  title: "Uganda Business Hub — Ideas, Businesses & Jobs",
  description: "Find business ideas, locate businesses, and browse jobs across all Uganda districts.",
};

export const revalidate = 60;

export default function HomePage() {
  return <HomeClient ideasCount={ideas.length} jobsTeaser={<HomeJobsTeaser />} />;
}
