'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, Edit2, User as UserIcon, Shield, Bell, Settings, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { usePushNotifications } from '@/hooks/usePushNotifications';


type Profile = {
  id: string;
  display_name: string | null;
  username: string | null;
  bio: string | null;
  created_at: string;
};

type SettingsPageProps = {
  user?: User;
  profile?: Profile;
  userInterests?: any[];
  userRole?: any;
  allRoles?: any[];
  allInterests?: any[];
};

type SettingsSection = 'profile' | 'privacy' | 'notifications' | 'preferences' | 'billing';

type NotificationSettingsState = {
  enable_push: boolean;
  enable_daily_summary: boolean;
};

type NotificationSettingsKey = keyof NotificationSettingsState;

export default function SettingsPage({
  user: propUser,
  profile: propProfile,
  userInterests,
  userRole,
  allRoles,
  allInterests,
}: SettingsPageProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const router = useRouter();
  const { supabase, user: supabaseUser } = useSupabase();
  const { toast } = useToast();

  const [notificationSettings, setNotificationSettings] = useState<{ enable_push: boolean; enable_daily_summary: boolean }>({
    enable_push: false,
    enable_daily_summary: false,
  });
  const [notificationLoading, setNotificationLoading] = useState(true);
  const [notificationSaving, setNotificationSaving] = useState(false);

  const sections = [
    { id: 'profile' as const, label: 'Profile', icon: UserIcon },
    { id: 'privacy' as const, label: 'Privacy', icon: Shield },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'preferences' as const, label: 'Preferences', icon: Settings },
    { id: 'billing' as const, label: 'Billing', icon: CreditCard },
  ];

    useEffect(() => {
    if (!supabaseUser) {
      setNotificationSettings({ enable_push: false, enable_daily_summary: false });
      setNotificationLoading(false);
      return;
    }

    let isActive = true;

    const loadSettings = async () => {
      setNotificationLoading(true);

      const { data, error } = await supabase
        .from('notification_settings')
        .select('enable_push, enable_daily_summary')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      if (!isActive) return;

      if (error) {
        console.error(error);
        toast({ title: 'Error loading settings', description: error.message, variant: 'destructive' });
        setNotificationSettings({ enable_push: false, enable_daily_summary: false });
      } else if (data) {
        setNotificationSettings({
          enable_push: data.enable_push ?? false,
          enable_daily_summary: data.enable_daily_summary ?? false,
        });
      } else {
        setNotificationSettings({ enable_push: false, enable_daily_summary: false });
      }

      setNotificationLoading(false);
    };

    loadSettings();

    return () => {
      isActive = false;
    };
  }, [supabase, supabaseUser, toast]);

  usePushNotifications(!notificationLoading && notificationSettings.enable_push);

  const updateNotificationSetting = async (key: 'enable_push' | 'enable_daily_summary', value: boolean) => {
    if (!supabaseUser) return;

    setNotificationSaving(true);

    const updatedSettings = {
      enable_push: key === 'enable_push' ? value : notificationSettings.enable_push,
      enable_daily_summary: key === 'enable_daily_summary' ? value : notificationSettings.enable_daily_summary,
    };

    const { error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: supabaseUser.id,
        ...updatedSettings,
      }, { onConflict: 'user_id' });

    setNotificationSaving(false);

    if (error) {
      console.error(error);
      toast({ title: 'Error updating setting', description: error.message, variant: 'destructive' });
      return;
    }

    setNotificationSettings(updatedSettings);
    toast({
      title: 'Updated',
      description: `Saved your ${key === 'enable_push' ? 'push' : 'daily email'} preference.`,
    });
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <ProfileSection
            user={propUser}
            profile={propProfile}
            userInterests={userInterests}
            userRole={userRole}
            allRoles={allRoles}
            allInterests={allInterests}
          />
        );
      case 'privacy':
        return <PrivacySection />;
      case 'notifications':
        return (
          <NotificationsSection
            settings={notificationSettings}
            loading={notificationLoading}
            saving={notificationSaving}
            onUpdateSetting={updateNotificationSetting}
          />
        );
      case 'preferences':
        return <PreferencesSection />;
      case 'billing':
        return <BillingSection />;
      default:
        return <ProfileSection user={propUser} profile={propProfile} userInterests={userInterests} userRole={userRole} allRoles={allRoles} allInterests={allInterests} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeSection === section.id
                        ? 'bg-green-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ 
  user: propUser, 
  profile: propProfile, 
  userInterests, 
  userRole, 
  allRoles, 
  allInterests 
}: { 
  user?: User; 
  profile?: Profile; 
  userInterests?: any[]; 
  userRole?: any; 
  allRoles?: any[]; 
  allInterests?: any[]; 
}) {
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState<'role' | 'interests' | ''>('');
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);

  const [form, setForm] = useState<Pick<Profile, "display_name" | "username" | "bio">>({
    display_name: propProfile?.display_name ?? "",
    username: propProfile?.username ?? "",
    bio: propProfile?.bio ?? "",
  });

  // Update form when props change
  useEffect(() => {
    if (propProfile) {
      setForm({
        display_name: propProfile.display_name ?? "",
        username: propProfile.username ?? "",
        bio: propProfile.bio ?? "",
      });
    }
    // Initialize role and interests from props
    if (userRole) {
      setSelectedRole(userRole.role_id);
    }
    if (userInterests) {
      setSelectedInterests(userInterests.map((item: any) => item.interest_id));
    }
  }, [propProfile, userRole, userInterests]);

  const handleChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSave = async () => {
    if (!propUser) return;

    // very light client validation
    const username = (form.username || "").trim();
    if (username && !/^[a-z0-9_]+$/i.test(username)) {
      toast({
        title: "Invalid username",
        description: "Use letters, numbers, or underscores only.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    // optimistic UI + optimistic concurrency using updated_at
    // Fetch current updated_at first (lightweight)
    const { data: current } = await supabase
      .from('profiles')
      .select('updated_at')
      .eq('id', propUser.id)
      .maybeSingle();

    const { data: upd, error } = await supabase
      .from("profiles")
      .update({
        display_name: form.display_name?.trim() || null,
        username: username || null,
        bio: form.bio?.trim() || null,
      })
      .eq("id", propUser.id)
      .eq('updated_at', current?.updated_at)
      .select('updated_at')
      .maybeSingle();

    setSaving(false);
    if (!error && !upd) {
      toast({
        title: 'Profile changed elsewhere',
        description: 'We reloaded your latest profile; please re-apply your edits.',
        variant: 'destructive',
      });
      // refresh page data
      // use a navigation to force a quick refresh without relying on a router here
      window.location.reload();
      return;
    }

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Profile saved", description: "Your changes are live." });
  };

  const saveRole = async () => {
    if (!propUser || selectedRole === null) return;

    setSaving(true);

    try {
      // Delete existing role
      await supabase
        .from('profile_roles')
        .delete()
        .eq('profile_id', propUser.id);

      // Insert new role
      const { error } = await supabase
        .from('profile_roles')
        .insert({
          profile_id: propUser.id,
          role_id: selectedRole
        });

      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      toast({ title: "Role updated", description: "Your role has been saved." });
      setEditingField('');
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveInterests = async () => {
    if (!propUser) return;

    setSaving(true);

    try {
      // Delete existing interests
      await supabase
        .from('profile_interests')
        .delete()
        .eq('profile_id', propUser.id);

      // Insert new interests
      if (selectedInterests.length > 0) {
        const { error } = await supabase
          .from('profile_interests')
          .insert(
            selectedInterests.map(interestId => ({
              profile_id: propUser.id,
              interest_id: interestId
            }))
          );

        if (error) {
          toast({
            title: "Update failed",
            description: error.message,
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
      }

      toast({ title: "Interests updated", description: "Your interests have been saved." });
      setEditingField('');
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update interests",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Profile</h3>
          <p className="text-gray-400 text-sm">These details appear on your public profile.</p>
        </div>
        <div className="h-6 w-40 animate-pulse rounded bg-gray-700" />
        <div className="mt-4 h-10 w-full animate-pulse rounded bg-gray-700" />
        <div className="mt-3 h-10 w-full animate-pulse rounded bg-gray-700" />
        <div className="mt-3 h-24 w-full animate-pulse rounded bg-gray-700" />
      </div>
    );
  }

  if (!propUser) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Profile</h3>
          <p className="text-gray-400 text-sm">Sign in to manage your profile.</p>
        </div>
        <p className="text-sm text-gray-400">No user session found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Profile</h3>
          <p className="text-gray-400 text-sm">These details appear on your public profile.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-gray-300">Display name</Label>
            <Input
              id="displayName"
              placeholder="Your display name"
              value={form.display_name ?? ""}
              onChange={handleChange("display_name")}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-300">Username</Label>
            <Input
              id="username"
              placeholder="username"
              value={form.username ?? ""}
              onChange={handleChange("username")}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
            <p className="text-xs text-gray-400">
              Only letters, numbers, and underscores.
            </p>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="bio" className="text-gray-300">Bio</Label>
            <Textarea
              id="bio"
              placeholder="A short description about you..."
              value={form.bio ?? ""}
              onChange={handleChange("bio")}
              rows={4}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          {/* Role Section */}
          <div className="space-y-2">
            <Label className="text-gray-300">Role</Label>
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-300">
                {userRole?.roles?.name || 'Not selected'}
              </span>
              <button
                onClick={() => setEditingField('role')}
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interests Section */}
          <div className="md:col-span-2 space-y-2">
            <Label className="text-gray-300">Interests</Label>
            <div className="p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">
                  {userInterests && userInterests.length > 0 
                    ? `${userInterests.length} interest${userInterests.length !== 1 ? 's' : ''} selected`
                    : 'No interests selected'
                  }
                </span>
                <button
                  onClick={() => setEditingField('interests')}
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {userInterests && userInterests.length > 0 ? (
                  userInterests.map((item: any) => (
                    <span 
                      key={item.interest_id} 
                      className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm"
                    >
                      {item.interests.name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">Click edit to add interests</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-400">
              Your profile is linked to your account (private ID in Supabase).
            </div>
            <div className="flex gap-2">
              <Button variant="outline" type="button" onClick={() => window.location.reload()} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Cancel
              </Button>
              <Button type="button" onClick={onSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Role Editing Modal */}
      {editingField === 'role' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto text-white">
            <h3 className="text-lg font-bold text-white mb-4">Edit Role</h3>
            <div className="space-y-3 mb-6">
              <p className="text-gray-300 text-sm">Select your role:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {allRoles?.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedRole === role.id
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
                    }`}
                  >
                    <h4 className="font-semibold text-sm">{role.name}</h4>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingField('')} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Cancel
              </Button>
              <Button onClick={saveRole} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
                {saving ? "Saving..." : "Save Role"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Interests Editing Modal */}
      {editingField === 'interests' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto text-white">
            <h3 className="text-lg font-bold text-white mb-4">Edit Interests</h3>
            <div className="space-y-3 mb-6">
              <p className="text-gray-300 text-sm">Select your interests (multiple allowed):</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {allInterests?.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => {
                      setSelectedInterests(prev => 
                        prev.includes(interest.id)
                          ? prev.filter(id => id !== interest.id)
                          : [...prev, interest.id]
                      );
                    }}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedInterests.includes(interest.id)
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
                    }`}
                  >
                    <h4 className="font-semibold text-sm">{interest.name}</h4>
                  </button>
                ))}
              </div>
              <div className="text-sm text-gray-400">
                Selected: {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingField('')} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Cancel
              </Button>
              <Button onClick={saveInterests} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
                {saving ? "Saving..." : "Save Interests"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PrivacySection() {
  const { supabase, user } = useSupabase();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPublic, setIsPublic] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_public')
        .eq('id', user.id)
        .single();
      if (!error && data) {
        setIsPublic(!!data.is_public);
      }
      setLoading(false);
    })();
  }, [supabase, user]);

  const onToggle = async (checked: boolean) => {
    if (!user) return;
    const prev = isPublic;
    setIsPublic(checked);
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ is_public: checked })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      setIsPublic(prev);
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Privacy updated',
        description: checked ? 'Your profile is now public.' : 'Your profile is now private.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Privacy Settings</h3>
          <p className="text-gray-400 text-sm">Control who can see your information.</p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-gray-300">Profile Visibility</Label>
              <p className="text-sm text-gray-400">
                Make your profile visible to other users
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={onToggle} disabled={loading || saving} />
          </div>
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-300">Show Email</Label>
                <p className="text-sm text-gray-400">
                  Display your email on your public profile
                </p>
              </div>
              <Switch disabled />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type NotificationsSectionProps = {
  settings: NotificationSettingsState;
  loading: boolean;
  saving: boolean;
  onUpdateSetting: (key: NotificationSettingsKey, value: boolean) => void;
};

function NotificationsSection({ settings, loading, saving, onUpdateSetting }: NotificationsSectionProps) {
  const { supabase, user } = useSupabase();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [unsubscribing, setUnsubscribing] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  const currentUA = typeof window !== 'undefined' ? navigator.userAgent : '';

  useEffect(() => {
    if (!user) {
      setLoadingSubs(false);
      return;
    }

    const loadSubs = async () => {
      setLoadingSubs(true);
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('id, user_agent, created_at, subscription')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        toast({
          title: 'Error loading subscriptions',
          description: error.message,
          variant: 'destructive',
        });
        setSubscriptions([]);
      } else {
        setSubscriptions(data || []);
      }

      setLoadingSubs(false);
    };

    loadSubs();
  }, [supabase, user, toast]);

  const parseDeviceName = (ua: string | null) => {
    if (!ua) return 'Unknown Device';
    if (ua.includes('Android')) return 'Android Device';
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('iPad')) return 'iPad';
    if (ua.includes('Macintosh')) return 'Mac';
    if (ua.includes('Windows')) return 'Windows PC';
    if (ua.includes('Linux')) return 'Linux Machine';
    return ua.split(' ')[0];
  };

  const isThisDevice = (ua: string | null) => {
    if (!ua || !currentUA) return false;
    return ua === currentUA;
  };

  const thisDeviceSubscribed = subscriptions.some((s) => isThisDevice(s.user_agent));

  const unsubscribeDevice = async (id: string) => {
    if (!user) return;
    setUnsubscribing(id);

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    setUnsubscribing(null);

    if (error) {
      toast({
        title: 'Unsubscribe failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Unsubscribed',
        description: 'This device has been unsubscribed from push notifications.',
      });
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const subscribeThisDevice = async () => {
    if (!user) return;

    try {
      setSubscribing(true);

      // 🔔 Request permission and create subscription via the service worker
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, // must be set in your .env
      });

      const { error } = await supabase.from('push_subscriptions').insert({
        user_id: user.id,
        subscription,
        user_agent: currentUA,
      });

      if (error) {
        console.error(error);
        toast({
          title: 'Subscription failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Device subscribed', description: 'This device will now receive push notifications.' });
        setSubscriptions((prev) => [
          {
            id: crypto.randomUUID(),
            user_agent: currentUA,
            created_at: new Date().toISOString(),
            subscription,
          },
          ...prev,
        ]);
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Permission denied',
        description: 'You may need to allow notifications in your browser settings.',
        variant: 'destructive',
      });
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) return <p className="text-gray-400 text-sm">Loading notification settings...</p>;

  return (
    <div className="space-y-6">
      {/* Notification Toggles */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Notifications</h3>
          <p className="text-gray-400 text-sm">Choose what you get notified about and how.</p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-gray-300">Daily Summary Email</Label>
              <p className="text-sm text-gray-400">Get a daily email summary of activity</p>
            </div>
            <Switch
              checked={settings.enable_daily_summary}
              disabled={saving}
              onCheckedChange={(val) => onUpdateSetting('enable_daily_summary', val)}
            />
          </div>

          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-300">Push Notifications</Label>
                <p className="text-sm text-gray-400">Receive push notifications in your browser</p>
              </div>
              <Switch
                checked={settings.enable_push}
                disabled={saving}
                onCheckedChange={(val) => onUpdateSetting('enable_push', val)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subscribed Devices */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Registered Devices</h3>
            <p className="text-gray-400 text-sm">Manage where you receive push notifications.</p>
          </div>

          {!thisDeviceSubscribed && (
            <Button
              onClick={subscribeThisDevice}
              disabled={subscribing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {subscribing ? 'Subscribing...' : 'Subscribe This Device'}
            </Button>
          )}
        </div>

        {loadingSubs ? (
          <p className="text-gray-400 text-sm">Loading devices...</p>
        ) : subscriptions.length === 0 ? (
          <p className="text-gray-400 text-sm">No devices currently subscribed.</p>
        ) : (
          <ul className="divide-y divide-gray-700">
            {subscriptions.map((sub) => (
              <li key={sub.id} className="flex items-center justify-between py-3">
                <div className="flex flex-col">
                  <span className="text-white font-medium">
                    {parseDeviceName(sub.user_agent)}
                    {isThisDevice(sub.user_agent) && (
                      <span className="ml-2 text-xs text-green-400 bg-green-400/20 px-2 py-0.5 rounded-full">
                        This Device
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-gray-400">
                    Subscribed: {new Date(sub.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-green-500" title="Subscribed" />
                  {!isThisDevice(sub.user_agent) && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={unsubscribing === sub.id}
                      onClick={() => unsubscribeDevice(sub.id)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      {unsubscribing === sub.id ? 'Unsubscribing...' : 'Unsubscribe'}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PreferencesSection() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Preferences</h3>
          <p className="text-gray-400 text-sm">Customize your experience.</p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-gray-300">Dark Mode</Label>
              <p className="text-sm text-gray-400">
                Use dark theme across the application
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-300">Auto-save</Label>
                <p className="text-sm text-gray-400">
                  Automatically save your changes
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillingSection() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Billing</h3>
          <p className="text-gray-400 text-sm">Manage your subscription and billing.</p>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-gray-700 rounded-lg">
            <h4 className="font-medium text-white mb-2">Current Plan</h4>
            <p className="text-gray-300 text-sm">Free Plan</p>
            <p className="text-gray-400 text-xs">No billing information required</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Upgrade Plan
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              View Usage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
