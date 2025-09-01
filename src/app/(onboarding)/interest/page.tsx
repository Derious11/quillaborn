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
    .select("id, display_name, username, onboarding_complete, early_access")
    .eq("id", user.id)
    .single<Profile>();

  // Waitlist-based gating for onboarding
  const email = (user.email || '').toLowerCase().trim();
  if (email) {
    const { data: wl } = await supabase
      .from('waitlist')
      .select('status')
      .eq('email', email)
      .maybeSingle<{ status: string }>();
    if (wl?.status === 'pending') redirect('/no-access?state=pending');
    if (!wl || !wl.status || wl.status !== 'approved') redirect('/no-access?state=unknown');
  } else {
    redirect('/no-access?state=unknown');
  }

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
