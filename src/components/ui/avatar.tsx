import Image from "next/image";
import type { Profile } from "@/lib/types";
import { getAvatarUrl } from "@/lib/avatar-utils";

interface AvatarProps {
  src?: string;
  profile?: Partial<Profile> | null;
  alt?: string;
  size?: number;
}

export function Avatar({ src, profile, alt = "", size = 12 }: AvatarProps) {
  const px = size * 4;
  
  // Determine the avatar source
  const avatarSrc = src || getAvatarUrl(profile);
  
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