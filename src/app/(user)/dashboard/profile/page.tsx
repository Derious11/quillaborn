import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import ProfilePage from '@/components/features/user/dashboard/ProfilePage';
import type { Profile } from '@/lib/types';

export default async function ProfileDashboardPage() {
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

  // Fetch pronouns list
  const { data: pronounsList } = await supabase
    .from('pronouns')
    .select('id, display_text')
    .order('display_text');

  if (profile) {
    return <ProfilePage 
      user={user} 
      profile={profile} 
      userInterests={userInterests || []}
      userRole={userRole}
      pronounsList={pronounsList || []}
    />;
  } else {
            redirect('/username');
  }
} 
