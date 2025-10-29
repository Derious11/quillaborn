import type { Profile } from "./types";

/**
 * Get the avatar URL for a profile based on avatar_kind and avatar_key.
 * Works with full or partial profiles.
 */
export function getAvatarUrl(profile?: Partial<Profile> | null): string {
  if (!profile) return "/avatars/presets/qb-avatar-00-quill.svg";

  // If avatar_kind is preset and we have an avatar_key, use the preset
  if (profile.avatar_kind === "preset" && profile.avatar_key) {
    return `/avatars/presets/${profile.avatar_key}`;
  }

  // If avatar_kind is upload and we have an avatar_url, use that
  if (profile.avatar_kind === "upload" && profile.avatar_url) {
    return profile.avatar_url;
  }

  // Fall back to avatar_url if it exists (for backward compatibility)
  if (profile.avatar_url) {
    return profile.avatar_url;
  }

  // Default fallback
  return "/avatars/presets/qb-avatar-00-quill.svg";
}

/**
 * Get a display name for an avatar file.
 */
export function getAvatarDisplayName(filename: string): string {
  return filename
    .replace("qb-avatar-", "")
    .replace(".svg", "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
