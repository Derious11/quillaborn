"use client";

import { useState } from "react";
import Image from "next/image";
import InviteModal from "@/components/projects/InviteModal";

interface Member {
  id: string;
  name: string;
  avatar_key?: string;
  role: string;
}

export default function ProjectHeader({
  project,
  members,
}: {
  project: {
    id: string;
    name: string;
    summary?: string;
    header_image_path?: string;
    owner_id: string;
  };
  members: Member[];
}) {
  const [showInvite, setShowInvite] = useState(false);

  function resolveAvatar(m: Member) {
    if (m.avatar_key && m.avatar_key.trim().length > 0) {
      return `/avatars/presets/${m.avatar_key}`;
    }
    return "/avatars/presets/qb-avatar-00-quill.svg";
  }

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-700 bg-gray-900">
      {/* Header image or fallback gradient */}
      {project.header_image_path ? (
        <Image
          src={project.header_image_path}
          alt="Project Header"
          width={1200}
          height={300}
          className="w-full h-48 object-cover opacity-90"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-r from-green-500/30 via-gray-800 to-green-600/30" />
      )}

      {/* Project title + summary */}
      <div className="absolute bottom-4 left-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent drop-shadow-md">
          {project.name}
        </h1>
        {project.summary && (
          <p className="text-gray-300 mt-1 drop-shadow-sm max-w-xl">
            {project.summary}
          </p>
        )}
      </div>

      {/* Members + invite */}
      <div className="absolute top-4 right-4 flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
        <div className="flex -space-x-2">
          {members.map((m) => (
            <Image
              key={m.id}
              src={resolveAvatar(m)}
              alt={m.name}
              width={36}
              height={36}
              className="rounded-full border-2 border-green-400 shadow-md"
            />
          ))}
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-gray-900 font-semibold text-sm rounded-full shadow transition-transform transform hover:scale-105"
        >
          + Invite
        </button>
      </div>

      <InviteModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        projectId={project.id}
        ownerId={project.owner_id}
      />
    </div>
  );
}
