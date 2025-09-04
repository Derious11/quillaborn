"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar as QBAvatar } from "@/components/ui/avatar";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import {
  Hash,
  User as UserNameIcon,
  FileText,
  Users,
  Briefcase,
  Heart,
  Edit2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import TimelineComposer from "@/components/profile/TimelineComposer";
import TimelineList from "@/components/profile/TimelineList";

type BadgeCore = { id: string; name: string; description: string; icon_url: string };
type BadgeDetail = BadgeCore & { assigned_at?: string | null };

interface ProfilePageProps {
  user: User;
  profile: Profile;
  userInterests?: any[];
  userRole?: any;
  pronounsList?: Array<{ id: number; display_text: string }>;
  userBadges?: Array<{
    badges: { id: string; name: string; description: string; icon_url: string };
    assigned_at?: string | null;
  }>;
}

export default function ProfilePage({
  user,
  profile,
  userInterests,
  userRole,
  pronounsList,
  userBadges,
}: ProfilePageProps) {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [profileVersion, setProfileVersion] = useState<string | null>(
    profile.updated_at ?? null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<
    "display_name" | "bio" | "pronouns" | "role" | "interests" | ""
  >("");
  const [editValue, setEditValue] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [selectedPronouns, setSelectedPronouns] = useState<string>("");
  const [roles, setRoles] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [activeBadge, setActiveBadge] = useState<BadgeDetail | null>(null);

  const openEditModal = async (
    field: "display_name" | "bio" | "pronouns" | "role" | "interests",
    currentValue?: string
  ) => {
    setEditingField(field);
    setError(null);
    setLoading(true);

    if (field === "role") {
      const { data: rolesData } = await supabase
        .from("roles")
        .select("*")
        .order("name");
      setRoles(rolesData || []);
      setSelectedRole(userRole?.role_id || null);
    } else if (field === "interests") {
      const { data: interestsData } = await supabase
        .from("interests")
        .select("*")
        .order("name");
      setInterests(interestsData || []);
      setSelectedInterests(
        userInterests?.map((item: any) => item.interest_id) || []
      );
    } else if (field === "pronouns") {
      setSelectedPronouns(currentValue || "");
    } else {
      setEditValue(currentValue || "");
    }

    setIsEditModalOpen(true);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingField) return;
    try {
      setSaving(true);
      setError(null);

      if (editingField === "display_name") {
        const value = editValue.trim() || null;
        const { error } = await supabase
          .from("profiles")
          .update({ display_name: value })
          .eq("id", user.id);
        if (error) throw error;
      } else if (editingField === "bio") {
        const value = editValue.trim() || null;
        const { error } = await supabase
          .from("profiles")
          .update({ bio: value })
          .eq("id", user.id);
        if (error) throw error;
      } else if (editingField === "pronouns") {
        let pronounId: number | null = null;
        if (selectedPronouns) {
          const match = pronounsList?.find(
            (p) => p.display_text === selectedPronouns
          );
          pronounId = match ? match.id : null;
        }
        const { error } = await supabase
          .from("profiles")
          .update({ pronoun_id: pronounId })
          .eq("id", user.id);
        if (error) throw error;
      } else if (editingField === "role") {
        // Ensure only one role: clear and set
        const { error: delRoleError } = await supabase
          .from("profile_roles")
          .delete()
          .eq("profile_id", user.id);
        if (delRoleError) throw delRoleError;

        if (selectedRole != null) {
          const { error: insRoleError } = await supabase
            .from("profile_roles")
            .insert({ profile_id: user.id, role_id: selectedRole });
          if (insRoleError) throw insRoleError;
        }
      } else if (editingField === "interests") {
        const { error: delError } = await supabase
          .from("profile_interests")
          .delete()
          .eq("profile_id", user.id);
        if (delError) throw delError;

        if (selectedInterests.length > 0) {
          const rows = selectedInterests.map((interest_id) => ({
            profile_id: user.id,
            interest_id,
          }));
          const { error: insError } = await supabase
            .from("profile_interests")
            .insert(rows);
          if (insError) throw insError;
        }
      }

      setIsEditModalOpen(false);
      setSaving(false);
      router.refresh();
    } catch (e: any) {
      setSaving(false);
      setError(e?.message || "Failed to save changes");
    }
  };

  // (handleSave function remains unchanged — omitted here for brevity)

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-start gap-6">
          {/* Left: Avatar with badges underneath */}
          <div className="flex flex-col items-center gap-3">
            <QBAvatar profile={profile} size={32} alt="Profile avatar" />
            {userBadges && userBadges.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {userBadges.map((ub) => (
                  <button
                    key={ub.badges.id}
                    type="button"
                    onClick={() => {
                      setActiveBadge({ ...(ub.badges as any), assigned_at: ub.assigned_at ?? null });
                      setIsBadgeModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-gray-700/60 rounded-full px-3 py-1 border border-gray-600 hover:border-green-500 hover:bg-gray-700 transition-colors"
                    title={(ub.badges.description || '').replace(
                      'Awarded to the first 100 members of Quillaborn who complete their bio.',
                      'Awarded to the first 100 members of Quillaborn.'
                    )}
                  >
                    {ub.badges.icon_url && (
                      <img
                        src={ub.badges.icon_url}
                        alt={ub.badges.name}
                        className="w-6 h-6 rounded-full border border-gray-500"
                      />
                    )}
                    <span className="text-xs text-gray-100 font-medium">
                      {ub.badges.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Name, username, pronouns */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white truncate">
                {profile.display_name || profile.username || "Unnamed"}
              </h2>
              <button
                onClick={() =>
                  openEditModal("display_name", profile.display_name || "")
                }
                className="text-gray-400 hover:text-green-400 transition-colors"
                aria-label="Edit display name"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-1 text-gray-400 text-sm flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Hash className="w-4 h-4" />
                {profile.username || "not-set"}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {profile.pronouns?.display_text || "Not provided"}
                <button
                  onClick={() =>
                    openEditModal("pronouns", profile.pronouns?.display_text || "")
                  }
                  className="ml-1 text-gray-400 hover:text-green-400 transition-colors"
                  aria-label="Edit pronouns"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">About</h3>

        {/* Role */}
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-green-400" />
          <span className="text-gray-300">
            {userRole?.roles?.name || "Not selected"}
          </span>
          <button
            onClick={() => openEditModal("role")}
            className="ml-1 text-gray-400 hover:text-green-400 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Bio */}
        <div className="flex items-start gap-2">
          <FileText className="w-5 h-5 text-green-400 mt-1" />
          <p className="text-gray-300 flex-1">
            {profile.bio || "No content provided"}
          </p>
          <button
            onClick={() => openEditModal("bio", profile.bio || "")}
            className="ml-1 text-gray-400 hover:text-green-400 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Interests */}
        <div className="flex items-start gap-2">
          <Heart className="w-5 h-5 text-green-400 mt-1" />
          <div className="flex flex-wrap gap-2 flex-1">
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
          <button
            onClick={() => openEditModal("interests")}
            className="ml-1 text-gray-400 hover:text-green-400 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Share an Update</h2>
          <TimelineComposer />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Your Posts</h2>
          <TimelineList profileId={user.id} isOwner={true} />
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">
            {editingField === "display_name" && "Edit display name"}
            {editingField === "bio" && "Edit bio"}
            {editingField === "pronouns" && "Edit pronouns"}
            {editingField === "role" && "Select role"}
            {editingField === "interests" && "Select interests"}
          </h3>

          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : (
            <div className="space-y-4">
              {editingField === "display_name" && (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Your display name"
                  maxLength={80}
                  disabled={saving}
                />
              )}

              {editingField === "bio" && (
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={5}
                  maxLength={500}
                  placeholder="Write a short bio"
                  disabled={saving}
                />
              )}

              {editingField === "pronouns" && (
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Pronouns</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={selectedPronouns}
                    onChange={(e) => setSelectedPronouns(e.target.value)}
                    disabled={saving}
                  >
                    <option value="">No preference</option>
                    {pronounsList?.map((p) => (
                      <option key={p.id} value={p.display_text}>
                        {p.display_text}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editingField === "role" && (
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Role</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={selectedRole ?? ""}
                    onChange={(e) =>
                      setSelectedRole(
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                    disabled={saving}
                  >
                    <option value="">No role</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editingField === "interests" && (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {interests.map((i) => {
                    const checked = selectedInterests.includes(i.id);
                    return (
                      <label key={i.id} className="flex items-center gap-3 text-gray-200">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInterests([...selectedInterests, i.id]);
                            } else {
                              setSelectedInterests(
                                selectedInterests.filter((id) => id !== i.id)
                              );
                            }
                          }}
                          disabled={saving}
                        />
                        <span>{i.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-green-500 text-gray-900 font-semibold hover:bg-green-600 disabled:opacity-50"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Badge Detail Modal */}
      <Modal isOpen={isBadgeModalOpen} onClose={() => setIsBadgeModalOpen(false)}>
        <div className="p-6 space-y-4">
          {activeBadge ? (
            <div className="flex items-start gap-4">
              {activeBadge.icon_url && (
                <img
                  src={activeBadge.icon_url}
                  alt={activeBadge.name}
                  className="w-16 h-16 rounded-xl border border-gray-600"
                />
              )}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">{activeBadge.name}</h3>
                {activeBadge.assigned_at && (
                  <p className="text-sm text-gray-300">
                    Awarded on {new Date(activeBadge.assigned_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                )}
                {activeBadge.description && (
                  <p className="text-gray-300">
                    {(activeBadge.description || '').replace(
                      'Awarded to the first 100 members of Quillaborn who complete their bio.',
                      'Awarded to the first 100 members of Quillaborn.'
                    )}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No badge selected</p>
          )}
          <div className="flex justify-end">
            <button
              className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600"
              onClick={() => setIsBadgeModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
