import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import BioPage from '@/components/features/onboarding/BioPage';
import type { Profile } from '@/lib/types';

export default async function BioPageRoute() {
  const supabase = createSupabaseServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile info with pronouns join
  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      id, 
      display_name, 
      username, 
      bio, 
      onboarding_complete,
      pronouns:pronoun_id(display_text)
    `)
    .eq("id", user.id)
    .single<Profile>();

  if (profile?.onboarding_complete) {
    redirect('/dashboard');
  }

  // Fetch pronouns list
  const { data: pronounsList } = await supabase
    .from("pronouns")
    .select("id, display_text")
    .order("display_text");

  const userData = {
    id: user.id,
    displayName: profile?.display_name || user.user_metadata?.name || "",
    username: profile?.username || "",
    bio: profile?.bio || "",
    pronouns: profile?.pronouns?.display_text || "",
  };

  return <BioPage user={userData} pronounsList={pronounsList || []} />;
} 