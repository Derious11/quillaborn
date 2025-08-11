import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import PublicProfile from "@/components/u/PublicProfile";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default async function PublicProfilePage({
  params: { username },
}: {
  params: { username: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile, error } = await supabase
    .from("user_profiles_public")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900 to-gray-900" />
        <div className="absolute inset-0 opacity-50 bg-gray-900" />
        <div className="relative max-w-4xl mx-auto px-6 py-10">
          <div className="mb-6">
            <Link
              href={user ? "/dashboard/explore" : "/explore"}
              className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200"
            >
              ← Back to Explore
            </Link>
          </div>
          <PublicProfile profile={profile as any} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
