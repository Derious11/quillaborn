export function Avatar({ src, alt = "", size = 12 }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-full w-${size} h-${size} object-cover border-2 border-primary`}
    />
  );
}