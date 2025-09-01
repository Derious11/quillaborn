"use client";

import { useEffect } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import type { User } from "@supabase/supabase-js";

export default function AuthListener() {
  const { supabase } = useSupabase();

  useEffect(() => {
    const syncUserProfile = async (_user: User) => {
      // Temporarily disable all automatic profile writes to prevent unintended overwrites.
      // If avatar syncing is desired later, re-enable with a dedicated endpoint.
      const updates: Record<string, any> = {};

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", _user.id);

        if (updateError) {
          console.error("Error updating profile:", updateError);
        } else {
          console.log("Profile sync skipped (no-op)");
        }
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        if (event === "SIGNED_IN" && session?.user) {
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
