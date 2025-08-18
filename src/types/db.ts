// types/db.ts
export type PublicProfileRow = {
  id: string | null;           // view can return null; we’ll guard
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_key: string | null;
  avatar_kind: string | null;
  avatar_path: string | null;
  avatar_url: string | null;
  roles: string[] | null;
  interests: string[] | null;
  updated_at: string | null;
};
