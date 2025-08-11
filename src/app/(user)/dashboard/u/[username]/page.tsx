import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import PublicProfile from '@/components/u/PublicProfile';

export default async function DashboardUserProfilePage({
  params: { username },
}: {
  params: { username: string };
}) {
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile, error } = await supabase
    .from('user_profiles_public')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !profile) {
    notFound();
  }

  return (
    <div className="px-6 py-6">
      <div className="mb-4">
        <Link
          href="/dashboard/explore"
          className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200"
        >
          ← Back to Explore
        </Link>
      </div>
      <PublicProfile profile={profile as any} />
    </div>
  );
}
