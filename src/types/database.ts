export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  admin: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_user_id: string
          created_at: string | null
          id: number
          metadata: Json | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          actor_user_id: string
          created_at?: string | null
          id?: number
          metadata?: Json | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string
          created_at?: string | null
          id?: number
          metadata?: Json | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      email_log: {
        Row: {
          created_at: string | null
          error: Json | null
          id: number
          provider_id: string | null
          sent_by: string | null
          status: string
          template: string
          to_email: string
          waitlist_id: string | null
        }
        Insert: {
          created_at?: string | null
          error?: Json | null
          id?: number
          provider_id?: string | null
          sent_by?: string | null
          status: string
          template: string
          to_email: string
          waitlist_id?: string | null
        }
        Update: {
          created_at?: string | null
          error?: Json | null
          id?: number
          provider_id?: string | null
          sent_by?: string | null
          status?: string
          template?: string
          to_email?: string
          waitlist_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      user_overview: {
        Row: {
          early_access: boolean | null
          email: string | null
          last_sign_in_at: string | null
          onboarding_complete: boolean | null
          profile_updated_at: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          user_id: string | null
          username: string | null
          waitlist_created_at: string | null
          waitlist_status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_get_user_overview: {
        Args: { p_limit?: number; p_offset?: number; p_search?: string }
        Returns: {
          early_access: boolean | null
          email: string | null
          last_sign_in_at: string | null
          onboarding_complete: boolean | null
          profile_updated_at: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          user_id: string | null
          username: string | null
          waitlist_created_at: string | null
          waitlist_status: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "user_overview"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      badges: {
        Row: {
          created_at: string | null
          criteria: string | null
          description: string | null
          icon_url: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          criteria?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          criteria?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      board_lists: {
        Row: {
          board_id: string
          id: string
          name: string
          position: number
        }
        Insert: {
          board_id: string
          id?: string
          name: string
          position: number
        }
        Update: {
          board_id?: string
          id?: string
          name?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "board_lists_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      boards: {
        Row: {
          id: string
          is_default: boolean
          name: string
          project_id: string
        }
        Insert: {
          id?: string
          is_default?: boolean
          name: string
          project_id: string
        }
        Update: {
          id?: string
          is_default?: boolean
          name?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boards_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      bug_feature: {
        Row: {
          created_at: string
          email: string | null
          id: number
          message: string | null
          name: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          message?: string | null
          name?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          message?: string | null
          name?: string | null
          type?: string | null
        }
        Relationships: []
      }
      card_assignees: {
        Row: {
          card_id: string
          user_id: string
        }
        Insert: {
          card_id: string
          user_id: string
        }
        Update: {
          card_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_assignees_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_assignees_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "card_assignees_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_assignees_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_assignees_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_assignees_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      card_comments: {
        Row: {
          author_id: string
          body: string
          card_id: string
          created_at: string
          id: string
        }
        Insert: {
          author_id: string
          body: string
          card_id: string
          created_at?: string
          id?: string
        }
        Update: {
          author_id?: string
          body?: string
          card_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_comments_author_id_profiles_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "card_comments_author_id_profiles_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_comments_author_id_profiles_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_comments_author_id_profiles_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_comments_author_id_profiles_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_comments_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          board_list_id: string
          created_at: string
          created_by: string
          description: string | null
          due_at: string | null
          id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          board_list_id: string
          created_at?: string
          created_by: string
          description?: string | null
          due_at?: string | null
          id?: string
          position: number
          title: string
          updated_at?: string
        }
        Update: {
          board_list_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          due_at?: string | null
          id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_board_list_id_fkey"
            columns: ["board_list_id"]
            isOneToOne: false
            referencedRelation: "board_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      community_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          position: number | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          position?: number | null
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          position?: number | null
          slug?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          body_md: string
          created_at: string | null
          id: string
          parent_id: string | null
          thread_id: string | null
          user_id: string | null
        }
        Insert: {
          body_md: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          thread_id?: string | null
          user_id?: string | null
        }
        Update: {
          body_md?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          thread_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "community_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string | null
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "community_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      community_threads: {
        Row: {
          body_md: string
          category_id: string | null
          created_at: string | null
          id: string
          likes: number | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          body_md: string
          category_id?: string | null
          created_at?: string | null
          id?: string
          likes?: number | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          body_md?: string
          category_id?: string | null
          created_at?: string | null
          id?: string
          likes?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_threads_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "community_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "community_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      debug_log: {
        Row: {
          created_at: string | null
          id: number
          message: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          message?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          message?: string | null
        }
        Relationships: []
      }
      email_link_claims: {
        Row: {
          created_at: string
          id: string
          target_uid: string
          token: string
          used_at: string | null
          waitlist_email: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_uid: string
          token: string
          used_at?: string | null
          waitlist_email: string
        }
        Update: {
          created_at?: string
          id?: string
          target_uid?: string
          token?: string
          used_at?: string | null
          waitlist_email?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          followed_id: string
          follower_id: string
        }
        Insert: {
          created_at?: string
          followed_id: string
          follower_id: string
        }
        Update: {
          created_at?: string
          followed_id?: string
          follower_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_followed_id_fkey"
            columns: ["followed_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "follows_followed_id_fkey"
            columns: ["followed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_followed_id_fkey"
            columns: ["followed_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_followed_id_fkey"
            columns: ["followed_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_followed_id_fkey"
            columns: ["followed_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      interests: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          content: string
          document_type: string
          id: number
          is_latest: boolean | null
          published_at: string
          title: string
          version: string
        }
        Insert: {
          content: string
          document_type: string
          id?: number
          is_latest?: boolean | null
          published_at?: string
          title: string
          version: string
        }
        Update: {
          content?: string
          document_type?: string
          id?: number
          is_latest?: boolean | null
          published_at?: string
          title?: string
          version?: string
        }
        Relationships: []
      }
      member_titles: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string | null
          enable_daily_summary: boolean
          enable_push: boolean
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          enable_daily_summary?: boolean
          enable_push?: boolean
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          enable_daily_summary?: boolean
          enable_push?: boolean
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json
          id: string
          kind: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          kind: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          kind?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      post_interactions: {
        Row: {
          comment_text: string | null
          created_at: string | null
          id: string
          parent_comment_id: string | null
          post_id: string
          reaction_key: string | null
          reaction_type: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment_text?: string | null
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          post_id: string
          reaction_key?: string | null
          reaction_type?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment_text?: string | null
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          reaction_key?: string | null
          reaction_type?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_interactions_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_interactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "profile_post_stats"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "profile_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "v_profile_post_stats"
            referencedColumns: ["post_id"]
          },
        ]
      }
      profile_interests: {
        Row: {
          created_at: string | null
          interest_id: number
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          interest_id: number
          profile_id: string
        }
        Update: {
          created_at?: string | null
          interest_id?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "profile_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_posts: {
        Row: {
          author_user_id: string
          body: string
          comment_count: number
          created_at: string
          id: string
          like_count: number
          media_meta: Json | null
          media_url: string | null
          profile_user_id: string
          reaction_count: number
          status: string
          updated_at: string
        }
        Insert: {
          author_user_id: string
          body: string
          comment_count?: number
          created_at?: string
          id?: string
          like_count?: number
          media_meta?: Json | null
          media_url?: string | null
          profile_user_id: string
          reaction_count?: number
          status?: string
          updated_at?: string
        }
        Update: {
          author_user_id?: string
          body?: string
          comment_count?: number
          created_at?: string
          id?: string
          like_count?: number
          media_meta?: Json | null
          media_url?: string | null
          profile_user_id?: string
          reaction_count?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_posts_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "profile_posts_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_posts_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_posts_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_posts_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_posts_profile_user_id_fkey"
            columns: ["profile_user_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "profile_posts_profile_user_id_fkey"
            columns: ["profile_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_posts_profile_user_id_fkey"
            columns: ["profile_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_posts_profile_user_id_fkey"
            columns: ["profile_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_posts_profile_user_id_fkey"
            columns: ["profile_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_roles: {
        Row: {
          created_at: string | null
          profile_id: string
          role_id: number
        }
        Insert: {
          created_at?: string | null
          profile_id: string
          role_id: number
        }
        Update: {
          created_at?: string | null
          profile_id?: string
          role_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "profile_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "profile_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_key: string | null
          avatar_kind: string | null
          avatar_path: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          early_access: boolean | null
          email: string | null
          id: string
          is_public: boolean
          onboarding_complete: boolean | null
          privacy_policy_accepted_at: string | null
          privacy_policy_accepted_version: string | null
          pronoun_id: number | null
          role: Database["public"]["Enums"]["user_role"]
          suspended_at: string | null
          terms_accepted_at: string | null
          terms_accepted_version: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_key?: string | null
          avatar_kind?: string | null
          avatar_path?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          early_access?: boolean | null
          email?: string | null
          id: string
          is_public?: boolean
          onboarding_complete?: boolean | null
          privacy_policy_accepted_at?: string | null
          privacy_policy_accepted_version?: string | null
          pronoun_id?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          suspended_at?: string | null
          terms_accepted_at?: string | null
          terms_accepted_version?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_key?: string | null
          avatar_kind?: string | null
          avatar_path?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          early_access?: boolean | null
          email?: string | null
          id?: string
          is_public?: boolean
          onboarding_complete?: boolean | null
          privacy_policy_accepted_at?: string | null
          privacy_policy_accepted_version?: string | null
          pronoun_id?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          suspended_at?: string | null
          terms_accepted_at?: string | null
          terms_accepted_version?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_pronoun_id_fkey"
            columns: ["pronoun_id"]
            isOneToOne: false
            referencedRelation: "pronouns"
            referencedColumns: ["id"]
          },
        ]
      }
      project_chat_messages: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          project_id: string
          reply_to: string | null
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          project_id: string
          reply_to?: string | null
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          project_id?: string
          reply_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_chat_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_chat_messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "project_chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          created_at: string
          description: string | null
          file_category: string | null
          file_name: string | null
          file_type: string | null
          id: string
          mime: string | null
          parent_file_id: string | null
          path: string
          project_id: string
          size_bytes: number | null
          tags: string[] | null
          updated_at: string | null
          uploader_id: string
          version: number | null
          visibility: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_category?: string | null
          file_name?: string | null
          file_type?: string | null
          id?: string
          mime?: string | null
          parent_file_id?: string | null
          path: string
          project_id: string
          size_bytes?: number | null
          tags?: string[] | null
          updated_at?: string | null
          uploader_id: string
          version?: number | null
          visibility?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_category?: string | null
          file_name?: string | null
          file_type?: string | null
          id?: string
          mime?: string | null
          parent_file_id?: string | null
          path?: string
          project_id?: string
          size_bytes?: number | null
          tags?: string[] | null
          updated_at?: string | null
          uploader_id?: string
          version?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "project_files_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      project_invites: {
        Row: {
          created_at: string
          id: string
          invitee_id: string
          inviter_id: string
          project_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invitee_id: string
          inviter_id: string
          project_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invitee_id?: string
          inviter_id?: string
          project_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_invites_invitee"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "fk_project_invites_invitee"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project_invites_invitee"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project_invites_invitee"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project_invites_invitee"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          joined_at: string
          project_id: string
          role: Database["public"]["Enums"]["member_role"]
          title: string | null
          user_id: string
        }
        Insert: {
          joined_at?: string
          project_id: string
          role?: Database["public"]["Enums"]["member_role"]
          title?: string | null
          user_id: string
        }
        Update: {
          joined_at?: string
          project_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "project_members_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          attachments: string[] | null
          author_id: string
          body_md: string
          created_at: string
          id: string
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: string[] | null
          author_id: string
          body_md: string
          created_at?: string
          id?: string
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: string[] | null
          author_id?: string
          body_md?: string
          created_at?: string
          id?: string
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "project_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          header_image_path: string | null
          id: string
          name: string
          owner_id: string
          plan_tier: string
          slug: string
          status: Database["public"]["Enums"]["project_status"]
          summary: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          header_image_path?: string | null
          id?: string
          name: string
          owner_id: string
          plan_tier?: string
          slug: string
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          header_image_path?: string | null
          id?: string
          name?: string
          owner_id?: string
          plan_tier?: string
          slug?: string
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pronouns: {
        Row: {
          created_at: string
          display_text: string
          id: number
        }
        Insert: {
          created_at?: string
          display_text: string
          id?: number
        }
        Update: {
          created_at?: string
          display_text?: string
          id?: number
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          subscription: Json
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          subscription: Json
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          subscription?: Json
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      sent_feedback_emails: {
        Row: {
          id: number
          sent_at: string
          user_email: string
        }
        Insert: {
          id?: number
          sent_at?: string
          user_email: string
        }
        Update: {
          id?: number
          sent_at?: string
          user_email?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          badge_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          badge_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          badge_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          email_norm: string
          id: string
          last_nudge_at: string | null
          last_nudge_error: string | null
          last_nudge_status: string | null
          name: string | null
          notes: string | null
          nudge_count: number
          referred_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          email: string
          email_norm?: string
          id?: string
          last_nudge_at?: string | null
          last_nudge_error?: string | null
          last_nudge_status?: string | null
          name?: string | null
          notes?: string | null
          nudge_count?: number
          referred_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          email_norm?: string
          id?: string
          last_nudge_at?: string | null
          last_nudge_error?: string | null
          last_nudge_status?: string | null
          name?: string | null
          notes?: string | null
          nudge_count?: number
          referred_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      waitlist_approval_tokens: {
        Row: {
          created_at: string
          email: string
          id: number
          token: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          token: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      profile_follow_counts: {
        Row: {
          follower_count: number | null
          following_count: number | null
          profile_id: string | null
        }
        Relationships: []
      }
      profile_post_stats: {
        Row: {
          comment_count: number | null
          like_count: number | null
          post_id: string | null
          reaction_count: number | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_key: string | null
          avatar_kind: string | null
          avatar_path: string | null
          avatar_url: string | null
          bio: string | null
          display_name: string | null
          id: string | null
          interests: string[] | null
          roles: string[] | null
          updated_at: string | null
          username: string | null
        }
        Relationships: []
      }
      user_profiles_allc: {
        Row: {
          avatar_key: string | null
          avatar_kind: string | null
          avatar_path: string | null
          avatar_url: string | null
          bio: string | null
          display_name: string | null
          id: string | null
          interests: string[] | null
          roles: string[] | null
          updated_at: string | null
          username: string | null
        }
        Relationships: []
      }
      user_profiles_public: {
        Row: {
          avatar_key: string | null
          avatar_kind: string | null
          avatar_path: string | null
          avatar_url: string | null
          bio: string | null
          display_name: string | null
          id: string | null
          interests: string[] | null
          roles: string[] | null
          updated_at: string | null
          username: string | null
        }
        Relationships: []
      }
      v_profile_post_stats: {
        Row: {
          author_user_id: string | null
          comment_count: number | null
          created_at: string | null
          like_count: number | null
          post_id: string | null
          profile_user_id: string | null
          reaction_count: number | null
          total_interactions: number | null
        }
        Insert: {
          author_user_id?: string | null
          comment_count?: number | null
          created_at?: string | null
          like_count?: number | null
          post_id?: string | null
          profile_user_id?: string | null
          reaction_count?: number | null
          total_interactions?: never
        }
        Update: {
          author_user_id?: string | null
          comment_count?: number | null
          created_at?: string | null
          like_count?: number | null
          post_id?: string | null
          profile_user_id?: string | null
          reaction_count?: number | null
          total_interactions?: never
        }
        Relationships: [
          {
            foreignKeyName: "profile_posts_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "profile_posts_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_posts_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_posts_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_posts_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_posts_profile_user_id_fkey"
            columns: ["profile_user_id"]
            isOneToOne: false
            referencedRelation: "profile_follow_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "profile_posts_profile_user_id_fkey"
            columns: ["profile_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_posts_profile_user_id_fkey"
            columns: ["profile_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_posts_profile_user_id_fkey"
            columns: ["profile_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_allc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_posts_profile_user_id_fkey"
            columns: ["profile_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_get_user_overview: {
        Args: { p_limit?: number; p_offset?: number; p_search?: string }
        Returns: Database["admin"]["Views"]["user_overview"]["Row"][]
        SetofOptions: {
          from: "*"
          to: "user_overview"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      complete_onboarding: {
        Args: {
          input_bio: string
          input_privacy_version: string
          input_pronoun_id: number
          input_terms_version: string
        }
        Returns: undefined
      }
      create_project_secure: {
        Args: { p_name: string; p_slug: string; p_summary?: string }
        Returns: string
      }
      delete_auth_user: { Args: { user_id: string }; Returns: undefined }
      delete_follow: { Args: { target_id: string }; Returns: undefined }
      finalize_waitlist_link: { Args: { p_token: string }; Returns: undefined }
      get_followers: {
        Args: { p_limit?: number; p_offset?: number; p_user_id: string }
        Returns: {
          followed_at: string
          follower_id: string
        }[]
      }
      get_following: {
        Args: { p_limit?: number; p_offset?: number; p_user_id: string }
        Returns: {
          followed_at: string
          followed_id: string
        }[]
      }
      get_inbox: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "messages"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_outbox: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "messages"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_public_profile: { Args: { profile_id: string }; Returns: Json }
      get_public_profiles: { Args: never; Returns: Json[] }
      get_threads: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          last_message_at: string
          last_message_body: string
          last_message_id: string
          last_message_read_at: string
          last_sender_id: string
          partner_id: string
          unread_count: number
        }[]
      }
      get_user_project_ids: {
        Args: { p_user: string }
        Returns: {
          project_id: string
        }[]
      }
      get_users_for_feedback_email: {
        Args: never
        Returns: {
          email: string
        }[]
      }
      insert_follow: { Args: { target_id: string }; Returns: undefined }
      is_project_member: { Args: { p_project_id: string }; Returns: boolean }
      mark_read: { Args: { p_message_id: string }; Returns: undefined }
      notify_project_members: {
        Args: {
          p_actor: string
          p_kind: string
          p_payload: Json
          p_project_id: string
        }
        Returns: undefined
      }
      send_message: {
        Args: { p_body: string; p_recipient_id: string }
        Returns: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        SetofOptions: {
          from: "*"
          to: "messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_post_stats: { Args: { p_post_id: string }; Returns: undefined }
    }
    Enums: {
      member_role: "owner" | "admin" | "editor" | "viewer"
      project_status: "active" | "archived"
      user_role: "user" | "moderator" | "admin" | "owner" | "support"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          format: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          format?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_level: { Args: { name: string }; Returns: number }
      get_prefix: { Args: { name: string }; Returns: string }
      get_prefixes: { Args: { name: string }; Returns: string[] }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          start_after?: string
        }
        Returns: {
          id: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_legacy_v1: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v1_optimised: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  admin: {
    Enums: {},
  },
  public: {
    Enums: {
      member_role: ["owner", "admin", "editor", "viewer"],
      project_status: ["active", "archived"],
      user_role: ["user", "moderator", "admin", "owner", "support"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS"],
    },
  },
} as const
