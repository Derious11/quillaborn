"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Avatar as QBAvatar } from '@/components/ui/avatar';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';
import { User as UserIcon, Hash, User as UserNameIcon, FileText, Users, Briefcase, Heart, Edit2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { useSupabase } from '@/components/providers/SupabaseProvider';

interface ProfilePageProps {
  user: User;
  profile: Profile;
  userInterests?: any[];
  userRole?: any;
  pronounsList?: Array<{
    id: number;
    display_text: string;
  }>;
}

export default function ProfilePage({ user, profile, userInterests, userRole, pronounsList }: ProfilePageProps) {
  const { supabase } = useSupabase();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<'display_name' | 'bio' | 'pronouns' | 'role' | 'interests' | ''>('');
  const [editValue, setEditValue] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [selectedPronouns, setSelectedPronouns] = useState<string>('');
  const [roles, setRoles] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openEditModal = async (field: 'display_name' | 'bio' | 'pronouns' | 'role' | 'interests', currentValue?: string) => {
    setEditingField(field);
    setError(null);
    setLoading(true);

    if (field === 'role') {
      // Fetch roles and set current selection
      const { data: rolesData } = await supabase.from('roles').select('*').order('name');
      setRoles(rolesData || []);
      setSelectedRole(userRole?.role_id || null);
    } else if (field === 'interests') {
      // Fetch interests and set current selections
      const { data: interestsData } = await supabase.from('interests').select('*').order('name');
      setInterests(interestsData || []);
      setSelectedInterests(userInterests?.map((item: any) => item.interest_id) || []);
    } else if (field === 'pronouns') {
      // Set current pronouns selection
      setSelectedPronouns(currentValue || '');
    } else {
      setEditValue(currentValue || '');
    }

    setIsEditModalOpen(true);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      if (editingField === 'role') {
        if (selectedRole === null) {
          setError('Please select a role');
          setSaving(false);
          return;
        }

        // Delete existing role and insert new one
        await supabase.from('profile_roles').delete().eq('profile_id', user.id);
        const { error: insertError } = await supabase
          .from('profile_roles')
          .insert({ profile_id: user.id, role_id: selectedRole });

        if (insertError) {
          setError('Failed to update role. Please try again.');
          setSaving(false);
          return;
        }
      } else if (editingField === 'interests') {
        // Delete existing interests and insert new ones
        await supabase.from('profile_interests').delete().eq('profile_id', user.id);
        
        if (selectedInterests.length > 0) {
          const interestRecords = selectedInterests.map(interestId => ({
            profile_id: user.id,
            interest_id: interestId
          }));

          const { error: insertError } = await supabase
            .from('profile_interests')
            .insert(interestRecords);

          if (insertError) {
            setError('Failed to update interests. Please try again.');
            setSaving(false);
            return;
          }
        }
      } else if (editingField === 'pronouns') {
        // Handle pronouns selection
        let pronounsValue = null;
        
        if (selectedPronouns !== '') {
          // Find the pronoun object that matches the selected display_text
          const selectedPronoun = pronounsList?.find(p => p.display_text === selectedPronouns);
          if (selectedPronoun) {
            // Store the ID since pronouns column is a foreign key
            pronounsValue = selectedPronoun.id;
          }
        }
        
        console.log('Updating pronouns:', { selectedPronouns, pronounsValue, userId: user.id });
        
        try {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ pronoun_id: pronounsValue })
            .eq('id', user.id);

          if (updateError) {
            console.error('Pronouns update error:', updateError);
            setError(`Failed to update pronouns: ${updateError.message}`);
            setSaving(false);
            return;
          }
        } catch (err) {
          console.error('Pronouns update exception:', err);
          setError(`Failed to update pronouns: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setSaving(false);
          return;
        }
      } else {
        // Handle text fields
        if (!editValue.trim()) {
          setError('This field cannot be empty');
          setSaving(false);
          return;
        }

        const updateData: any = {};
        
        switch (editingField) {
          case 'display_name':
            updateData.display_name = editValue.trim();
            break;
          case 'bio':
            updateData.bio = editValue.trim();
            break;
          default:
            setError('Invalid field');
            setSaving(false);
            return;
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);

        if (updateError) {
          setError('Failed to update profile. Please try again.');
          setSaving(false);
          return;
        }
      }

      setIsEditModalOpen(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="bg-gray-800 rounded-lg p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <QBAvatar profile={profile} size={16} alt="Profile avatar" />
            <div>
              <h3 className="text-lg font-semibold">Avatar</h3>
              <p className="text-gray-300 text-sm">Shown on your public profile</p>
            </div>
          </div>
          <Link
            href="/profile/avatar"
            className="text-gray-400 hover:text-green-400 transition-colors text-sm underline"
          >
            Change
          </Link>
        </div>

        {/* Username Card */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Hash className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold">Username</h3>
            </div>
          </div>
          <p className="text-gray-300">{profile.username || 'Not selected'}</p>
        </div>

        {/* Display Name Card */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <UserNameIcon className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold">Display Name</h3>
            </div>
            <button
              onClick={() => openEditModal('display_name', profile.display_name || '')}
              className="text-gray-400 hover:text-green-400 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-gray-300">{profile.display_name || 'Not provided'}</p>
        </div>

        {/* Pronouns Card */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold">Pronouns</h3>
            </div>
            <button
              onClick={() => openEditModal('pronouns', profile.pronouns?.display_text || '')}
              className="text-gray-400 hover:text-green-400 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-gray-300">{profile.pronouns?.display_text || 'Not provided'}</p>
        </div>

        {/* Role Card */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold">Role</h3>
            </div>
            <button
              onClick={() => openEditModal('role')}
              className="text-gray-400 hover:text-green-400 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-gray-300">{userRole?.roles?.name || 'Not selected'}</p>
        </div>

        {/* Bio Card */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold">Bio</h3>
            </div>
            <button
              onClick={() => openEditModal('bio', profile.bio || '')}
              className="text-gray-400 hover:text-green-400 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-gray-300">{profile.bio || 'No content provided'}</p>
        </div>

        {/* Interests Card */}
        <div className="bg-gray-800 rounded-lg p-6 md:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold">Interests</h3>
            </div>
            <button
              onClick={() => openEditModal('interests')}
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
              <p className="text-gray-400">No interests selected</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <div className="text-white flex flex-col h-full p-4 sm:p-6">
          {/* Header */}
          <div className="flex-shrink-0 mb-4">
            <h3 className="text-lg sm:text-xl font-bold">
              Edit {editingField === 'display_name' ? 'Display Name' : 
                     editingField === 'bio' ? 'Bio' : 
                     editingField === 'pronouns' ? 'Pronouns' :
                     editingField === 'role' ? 'Role' :
                     editingField === 'interests' ? 'Interests' : 'Field'}
            </h3>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading...</div>
              </div>
            ) : editingField === 'role' ? (
              <div className="space-y-3">
                <p className="text-gray-300 text-sm">Select your role:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 md:max-h-80 overflow-y-auto">
                  {roles.map((role) => (
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
            ) : editingField === 'interests' ? (
              <div className="space-y-3">
                <p className="text-gray-300 text-sm">Select your interests (multiple allowed):</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 md:max-h-80 overflow-y-auto">
                  {interests.map((interest) => (
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
            ) : editingField === 'pronouns' ? (
              <div className="space-y-3">
                <p className="text-gray-300 text-sm">Select your pronouns:</p>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => setSelectedPronouns('')}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedPronouns === ''
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
                    }`}
                  >
                    <h4 className="font-semibold text-sm">No preference</h4>
                  </button>
                  {pronounsList?.map((pronoun) => (
                    <button
                      key={pronoun.id}
                      onClick={() => setSelectedPronouns(pronoun.display_text)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedPronouns === pronoun.display_text
                          ? 'border-green-500 bg-green-500/10 text-green-400'
                          : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
                      }`}
                    >
                      <h4 className="font-semibold text-sm">{pronoun.display_text}</h4>
                    </button>
                  ))}
                </div>
              </div>
            ) : editingField === 'bio' ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Enter your bio..."
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
              />
            ) : (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={`Enter your ${editingField === 'display_name' ? 'display name' : 'pronouns'}...`}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                maxLength={50}
              />
            )}
            
            {editingField === 'bio' && (
              <div className="text-right text-sm text-gray-400 mt-1">
                {editValue.length}/500
              </div>
            )}
            
            {error && (
              <div className="text-red-400 text-sm mt-2">{error}</div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex-shrink-0 flex gap-3 mt-4 pt-4 border-t border-gray-700">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-gray-900 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 