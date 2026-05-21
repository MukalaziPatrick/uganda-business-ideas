import type { Metadata } from "next";
import PostJobForm from "./PostJobForm";

export const metadata: Metadata = {
  title: "Post a Job | Uganda Business Hub",
  description: "Post a job vacancy in Uganda. Free to list. Reach job seekers in your district.",
};

export default function PostJobPage() {
  return <PostJobForm />;
}