// src/components/dashboard/Dashboard.tsx

"use client";

import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import HomePage from './HomePage';

// The 'profile' prop is now guaranteed to be non-null by the page logic
export default function Dashboard({ user, profile }: { user: User; profile: Profile }) {
  return (
    <DashboardLayout user={user} profile={profile}>
      <HomePage user={user} profile={profile} />
    </DashboardLayout>
  );
}
