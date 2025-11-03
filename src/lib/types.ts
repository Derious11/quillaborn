// src/lib/types.ts

// Defines the structure of your public.profiles table
// This ensures your data has a consistent shape across the app.
export type Profile = {
  id: string;
  created_at: string;
  updated_at?: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  avatar_kind: "none" | "preset" | "upload" | null;
  avatar_key: string | null;
  bio: string | null;
  pronouns: { display_text: string } | null;
  onboarding_complete: boolean;
  early_access?: boolean;
  email: string | null;
};

export type DropResult = {
  cardId: string;
  boardListId: string;
  position: number;
};
