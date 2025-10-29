// src/components/dashboard/Dashboard.tsx

"use client";

import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HomePage from "./HomePage";

export default function Dashboard({
  user,
  profile,
}: {
  user: User;
  profile: Profile;
}) {
  const stats = {
    creativeStreakDays: 0,
    projectsCount: 0,
    postsCount: 0,
    followersCount: 0,
  };

  const creativePulses: any[] = []; // placeholder feed

  return (
    <DashboardLayout user={user} profile={profile}>
      <HomePage
        user={user}
        profile={profile}
        stats={stats}
        creativePulses={creativePulses}
      />
    </DashboardLayout>
  );
}
