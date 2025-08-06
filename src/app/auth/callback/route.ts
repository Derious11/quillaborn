import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  console.log('Auth callback received:', { code: !!code, next, origin });

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Get the user to check their profile
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log('User authenticated:', { id: user.id, email: user.email });
        
        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, display_name, onboarding_complete, early_access')
          .eq('id', user.id)
          .maybeSingle();

        console.log('Profile check result:', { profile, profileError });

        let redirectPath = next;
        
        if (!profile) {
          console.log('No profile found, creating new profile for user:', user.id);
          // No profile exists, create one for the new user
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              display_name: user.user_metadata?.name || null,
              onboarding_complete: false,
              early_access: false // Default to no early access
            });

          console.log('Profile creation result:', { insertError });

          if (insertError) {
            console.error('Error creating profile:', insertError);
            // If profile creation fails, redirect to no access page
            redirectPath = '/no-access';
          } else {
            // Profile created successfully, check early access
            console.log('Profile created successfully, checking early access');
            if (false) { // Default to no early access for new users
              redirectPath = '/username';
            } else {
              redirectPath = '/no-access';
            }
          }
        } else {
          // Profile exists, check early access first
          console.log('Profile exists, checking early access');
          console.log('Profile details:', { 
            id: profile.id, 
            username: profile.username, 
            display_name: profile.display_name, 
            onboarding_complete: profile.onboarding_complete,
            early_access: profile.early_access
          });
          
          if (!profile.early_access) {
            console.log('User does not have early access, redirecting to no-access page');
            redirectPath = '/no-access';
          } else if (!profile.onboarding_complete) {
            console.log('User has early access but onboarding incomplete, redirecting to onboarding');
            redirectPath = '/username';
          } else {
            console.log('User has early access and onboarding complete, redirecting to dashboard');
            redirectPath = '/dashboard';
          }
        }

        const fullRedirectUrl = `${origin}${redirectPath}`;
        console.log('Auth successful, redirecting to:', fullRedirectUrl);
        console.log('URL components:', { origin, redirectPath, fullRedirectUrl });
        return NextResponse.redirect(fullRedirectUrl);
      } else {
        console.log('No user found after auth exchange');
      }
    } else {
      console.error('Auth error:', error);
    }
  }

  console.log('Auth failed, redirecting to login');
  // If there's an error or no code, redirect to login
  return NextResponse.redirect(`${origin}/login`);
} 