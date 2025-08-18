import Link from "next/link";
import ProfileTimelineView from "@/components/u/ProfileTimelineView";

export default async function DashboardProfilePage({
  params: { username },
}: {
  params: { username: string };
}) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Back to Explore */}
      <div className="mb-6">
        <Link
          href="/dashboard/explore"
          className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200"
        >
          ← Back to Explore
        </Link>
      </div>

      <ProfileTimelineView username={username} />
    </div>
  );
}
