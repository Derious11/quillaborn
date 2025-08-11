// src/app/(user)/dashboard/settings/page.tsx

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import SettingsPage from '@/components/settings/SettingsPage';
import type { Profile } from '@/lib/types';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — Quillaborn",
  description: "Manage your account, privacy, notifications, preferences, and billing.",
};

export default async function Settings() {
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the user's profile with interests and role
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      pronouns:pronoun_id(display_text)
    `)
    .eq('id', user.id)
    .single<Profile>();

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

  // Fetch all available roles and interests for editing
  const { data: allRoles } = await supabase
    .from('roles')
    .select('*')
    .order('name');

  const { data: allInterests } = await supabase
    .from('interests')
    .select('*')
    .order('name');

  // Check if profile exists and onboarding is complete
  if (!profile) {
    // If no profile exists, redirect to onboarding
    redirect('/username');
  }

  if (!profile.onboarding_complete) {
    // If onboarding is not complete, redirect to onboarding
    redirect('/username');
  }

  return <SettingsPage 
    user={user} 
    profile={profile} 
    userInterests={userInterests || []}
    userRole={userRole}
    allRoles={allRoles || []}
    allInterests={allInterests || []}
  />;
}
