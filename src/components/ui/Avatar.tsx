import Image from "next/image";

interface AvatarProps {
  src: string;
  alt?: string;
  size?: number;
}

export function Avatar({ src, alt = "", size = 12 }: AvatarProps) {
  const px = size * 4;
  return (
    <Image
      src={src}
      alt={alt}
      width={px}
      height={px}
      className={`rounded-full object-cover border-2 border-primary`}
      style={{ width: `${px}px`, height: `${px}px` }}
    />
  );
}