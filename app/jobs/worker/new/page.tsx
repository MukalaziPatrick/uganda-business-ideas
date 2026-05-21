import type { Metadata } from "next";
import WorkerForm from "./WorkerForm";

export const metadata: Metadata = {
  title: "Register as a Worker | Uganda Business Hub",
  description: "Create a free worker profile. Let employers in Uganda find you.",
};

export default function WorkerNewPage() {
  return <WorkerForm />;
}
