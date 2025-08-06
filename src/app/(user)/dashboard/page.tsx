// src/app/dashboard/page.tsx

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import HomePage from '@/components/features/user/dashboard/HomePage';
import type { Profile } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the user's profile with interests and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  // Check if profile exists and onboarding is complete
  if (!profile) {
    // If no profile exists, redirect to onboarding
    redirect('/username');
  }

  if (!profile.onboarding_complete) {
    // If onboarding is not complete, redirect to onboarding
    redirect('/username');
  }

  // Fetch user's interests
  const { data: userInterests } = await supabase
    .from('profile_interests')
    .select(`
      interest_id,
      interests (
        id,
        name
      )
    `)
    .eq('profile_id', user.id);

  // Fetch user's role
  const { data: userRole } = await supabase
    .from('profile_roles')
    .select(`
      role_id,
      roles (
        id,
        name
      )
    `)
    .eq('profile_id', user.id)
    .single();

  // Show the dashboard only if onboarding is complete
  return <HomePage 
    user={user} 
    profile={profile} 
    userInterests={userInterests || []}
    userRole={userRole}
  />;
}
