import Image from "next/image";
import type { Profile } from "@/lib/types";
import { getAvatarUrl } from "@/lib/avatar-utils";

interface AvatarProps {
  src?: string;
  profile?: Profile;
  alt?: string;
  size?: number;
}

export function Avatar({ src, profile, alt = "", size = 12 }: AvatarProps) {
  const px = size * 4;
  
  // Determine the avatar source
  const avatarSrc = src || (profile ? getAvatarUrl(profile) : '/avatar-fallback.png');
  
  return (
    <Image
      src={avatarSrc}
      alt={alt}
      width={px}
      height={px}
      className={`rounded-full object-cover border-2 border-primary`}
      style={{ width: `${px}px`, height: `${px}px` }}
    />
  );
}