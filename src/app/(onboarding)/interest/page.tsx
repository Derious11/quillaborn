import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import InterestPage from '@/components/features/onboarding/InterestPage';
import type { Profile } from '@/lib/types';

export default async function InterestPageRoute() {
  const supabase = createSupabaseServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile info
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, username, onboarding_complete")
    .eq("id", user.id)
    .single<Profile>();

  if (profile?.onboarding_complete) {
    redirect('/dashboard');
  }

  const userData = {
    id: user.id,
    displayName: profile?.display_name || user.user_metadata?.name || "",
    username: profile?.username || "",
  };

  return <InterestPage user={userData} />;
} 