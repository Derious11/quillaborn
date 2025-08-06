import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import ExplorePage from '@/components/features/user/dashboard/ExplorePage';
import type { Profile } from '@/lib/types';

export default async function ExploreDashboardPage() {
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  if (profile) {
    return <ExplorePage />;
  } else {
            redirect('/username');
  }
} 