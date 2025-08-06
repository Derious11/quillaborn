import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import UsernamePage from '@/components/features/onboarding/UsernamePage';
import type { Profile } from '@/lib/types';

export default async function UsernamePageRoute() {
  try {
    const supabase = createSupabaseServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('UsernamePageRoute: No user, redirecting to login');
      redirect('/login');
    }

    console.log('UsernamePageRoute: User authenticated:', { id: user.id, email: user.email });

    // Fetch profile info for display name, username
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name, username, onboarding_complete")
      .eq("id", user.id)
      .maybeSingle<Profile>();

    console.log('UsernamePageRoute: Profile check:', { profile, profileError });

    if (profileError) {
      console.error('UsernamePageRoute: Profile error:', profileError);
      // If there's an error fetching profile, still show the page
    }

    if (profile?.onboarding_complete) {
      console.log('UsernamePageRoute: Onboarding complete, redirecting to dashboard');
      redirect('/dashboard');
    }

    const userData = {
      id: user.id,
      displayName: profile?.display_name || user.user_metadata?.name || "",
      username: profile?.username || "",
      email: user.email || "",
    };

    console.log('UsernamePageRoute: Rendering with userData:', userData);

    return <UsernamePage user={userData} />;
  } catch (error) {
    console.error('UsernamePageRoute: Unexpected error:', error);
    // Return a simple error page instead of crashing
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-400">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }
}
