import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProfileTimelineView from "@/components/u/ProfileTimelineView";

export default async function PublicProfilePage({ params: { username } }: { params: { username: string } }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900 to-gray-900" />
        <div className="absolute inset-0 opacity-50 bg-gray-900" />
        <div className="relative max-w-4xl mx-auto px-6 py-10">
          <div className="mb-6">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200"
            >
              ← Back to Explore
            </Link>
          </div>
          <ProfileTimelineView username={username} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
