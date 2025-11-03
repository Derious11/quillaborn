'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { AvatarSelector } from '@/components/features/avatar/AvatarSelector';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/types/database';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AvatarSelectionPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      // Use session to avoid transient null user
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile',
          variant: 'destructive',
        });
        return;
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setAuthChecked(true);
    }
  };

  const handleAvatarSelect = async (avatarKey: string) => {
    if (!profile) return;

    setIsUpdating(true);
    try {
      const avatarUrl = `/avatars/presets/${avatarKey}`;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_kind: 'preset',
          avatar_key: avatarKey,
          avatar_url: avatarUrl,
        })
        .eq('id', profile.id);

      if (error) {
        console.error('Error updating avatar:', error);
        toast({
          title: 'Error',
          description: 'Failed to update avatar',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Avatar updated successfully!',
      });
      
      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        avatar_kind: 'preset',
        avatar_key: avatarKey,
        avatar_url: avatarUrl,
      } : null);

      // Navigate back to profile after a short delay
      setTimeout(() => {
        router.push('/dashboard/profile');
      }, 1500);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header onJoinWaitlist={() => {}} />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900 to-gray-900"></div>
        <div className="absolute inset-0 opacity-50 bg-gray-900"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-10 lg:py-16">
          <div className="flex items-center gap-2 mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">Choose Your Avatar</span>
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Pick a preset avatar to represent you across Quillaborn. You can change this anytime.
            </p>
          </div>

          <div className="relative bg-gray-900/60 rounded-2xl p-4 md:p-6 border border-gray-800">
            <AvatarSelector
              currentAvatarKey={profile?.avatar_key}
              onSelect={handleAvatarSelect}
              isLoading={isUpdating}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
