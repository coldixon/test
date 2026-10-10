import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import SavedJobsList from "@/components/SavedJobsList";

export const metadata: Metadata = {
  title: "Saved jobs",
  description: "Jobs you bookmarked to apply to later.",
};

export default function SavedPage() {
  return (
    <div className="container-x py-8">
      <SectionHeading as="h1" title="Saved jobs" subtitle="Bookmarked in this browser. Apply when you're ready." href="/jobs" linkLabel="Find more jobs" />
      <SavedJobsList />
    </div>
  );
}
