import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';

interface HomePageProps {
  user: User;
  profile: Profile;
  userInterests?: any[];
  userRole?: any;
}

export default function HomePage({ user, profile, userInterests, userRole }: HomePageProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Welcome back, {profile.display_name || profile.username}!</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
          <p className="text-gray-400">No recent activity</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <p className="text-gray-400">Start a new project</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Community</h3>
          <p className="text-gray-400">Connect with creators</p>
        </div>
      </div>
    </div>
  );
} 