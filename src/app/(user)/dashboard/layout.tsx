import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import DashboardLayout from '@/components/layout/DashboardLayout';
import type { Profile } from '@/lib/types';

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (profile) {
    return (
      <DashboardLayout 
        user={user} 
        profile={profile}
        userInterests={userInterests || []}
        userRole={userRole}
      >
        {children}
      </DashboardLayout>
    );
  } else {
            redirect('/username');
  }
} 
