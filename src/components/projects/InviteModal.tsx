"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal"; // your existing modal wrapper

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  ownerId: string;
}

interface User {
  id: string;
  name: string;
  avatar_key?: string;
}

function resolveAvatar(avatar_key?: string) {
  if (avatar_key && avatar_key.trim().length > 0) {
    return `/avatars/presets/${avatar_key}`;
  }
  return "/avatars/presets/qb-avatar-00-quill.svg"; // fallback preset
}

export default function InviteModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  ownerId,
}: InviteModalProps) {
  const { supabase } = useSupabase();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchFollowedUsers() {
      if (!isOpen) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("follows")
        .select(
          "followed_id, profiles!follows_followed_id_fkey(id, display_name, username, avatar_key)"
        )
        .eq("follower_id", ownerId);

      if (error) {
        console.error("Fetch follows error:", error);
        setUsers([]);
      } else {
        setUsers(
          (data || []).map((f: any) => ({
            id: f.profiles?.id,
            name: f.profiles?.display_name || f.profiles?.username,
            avatar_key: f.profiles?.avatar_key,
          }))
        );
      }
      setLoading(false);
    }

    fetchFollowedUsers();
  }, [isOpen, supabase, ownerId]);

  async function handleInvite(userId: string) {
  try {
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invitedUserId: userId,
        projectId,
        projectName: "My Project", // TODO: pass real project name as prop
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send invite");

    // remove invited user from list so they don’t get invited twice
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  } catch (err) {
    console.error("Invite error:", err);
  }
}

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 flex flex-col flex-1 text-white">
        <h2 className="text-xl font-bold mb-4 text-green-400">
          Invite a Follower to {projectName}
        </h2>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-400">
            No followed users available to invite.
          </p>
        ) : (
          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={resolveAvatar(u.avatar_key)}
                    alt={u.name}
                    width={32}
                    height={32}
                    className="rounded-full border border-green-400"
                  />
                  <span className="text-sm font-medium">{u.name}</span>
                </div>
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-gray-900 rounded-full"
                  onClick={() => handleInvite(u.id)}
                >
                  Invite
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300 hover:text-green-400 hover:border-green-400 rounded-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
