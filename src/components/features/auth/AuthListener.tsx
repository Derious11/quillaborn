// src/components/AuthListener.tsx

"use client";

import { useEffect } from 'react';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import type { User } from '@supabase/supabase-js';

export default function AuthListener() {
  const { supabase } = useSupabase();
  
  useEffect(() => {
    const syncUserProfile = async (user: User) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      const googleIdentity = user.identities?.find(id => id.provider === 'google');
      const avatarUrl = googleIdentity?.identity_data?.avatar_url;
      
      if (profile) {
        // --- UPDATE LOGIC (FIXED) ---
        // Profile exists, so only update the avatar URL.
        console.log("Existing profile found. Syncing avatar...");
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', user.id);

        if (updateError) {
          console.error("Error updating avatar:", updateError);
        }
      } else {
        // --- CREATE LOGIC (NOW WITH UNIQUE USERNAMES) ---
        console.log("No profile found. Creating a new one...");
        let username = googleIdentity?.identity_data?.full_name || user.email?.split('@')[0] || `user_${Date.now()}`;
        
        // Check if username is taken and append random numbers if it is
        let isUnique = false;
        while (!isUnique) {
          const { data: existingUser, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();

          if (error && error.code === 'PGRST116') {
            // 'PGRST116' means no user was found, so the username is unique
            isUnique = true;
          } else if (existingUser) {
            // Username is taken, append 4 random digits
            username = `${username}_${Math.floor(1000 + Math.random() * 9000)}`;
          } else {
            // An unexpected error occurred, or no existing user was found. Proceed.
            isUnique = true;
          }
        }

        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            avatar_url: avatarUrl,
            username: username, // Use the guaranteed unique username
            early_access: false, // Default to no early access
          });
          
        if (insertError) {
          console.error("Error creating profile:", insertError);
        }
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (event === "SIGNED_IN" && session) {
          syncUserProfile(session.user);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  return null;
}