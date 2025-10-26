# Quillaborn — Database Functions

_Last exported from Supabase using `SELECT ... FROM pg_proc`._

This document lists all stored **PostgreSQL functions and Supabase RPCs** across the `admin`, `public`, and `storage` schemas.  
These functions include both application-defined RPCs and internal trigger helpers used by Supabase.

---

## ⚙️ admin schema

| Function | Arguments | Returns | Purpose |
|-----------|------------|----------|----------|
| `admin_get_user_overview` | `p_limit integer DEFAULT 50, p_offset integer DEFAULT 0, p_search text DEFAULT ''` | `user_overview` | Returns a paginated summary of users for the admin dashboard. |

---

## ⚙️ public schema

| Function | Arguments | Returns | Purpose |
|-----------|------------|----------|----------|
| `_chat_notify` | — | `trigger` | Sends realtime chat notifications when a message is inserted. |
| `_update_notify` | — | `trigger` | Sends realtime update notifications when a project update is posted. |
| `admin_get_user_overview` | `p_limit integer DEFAULT 50, p_offset integer DEFAULT 0, p_search text DEFAULT ''` | `user_overview` | Same as admin schema version, exposed in public schema. |
| `complete_onboarding` | `input_bio text, input_pronoun_id bigint, input_terms_version text, input_privacy_version text` | `void` | Finalizes a user's onboarding flow. |
| `create_project_secure` | `p_name text, p_slug text, p_summary text DEFAULT NULL` | `uuid` | Creates a project and associates the creator securely. |
| `delete_auth_user` | `user_id uuid` | `void` | Deletes a user from Auth (admin-only). |
| `delete_follow` | `target_id uuid` | `void` | Removes a follow relationship. |
| `finalize_waitlist_link` | `p_token text` | `void` | Completes waitlist signup using approval token. |
| `get_followers` | `p_user_id uuid, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0` | `record` | Returns followers of a user. |
| `get_following` | `p_user_id uuid, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0` | `record` | Returns accounts followed by a user. |
| `get_inbox` | `p_limit integer DEFAULT 50, p_offset integer DEFAULT 0` | `messages` | Lists received messages. |
| `get_outbox` | `p_limit integer DEFAULT 50, p_offset integer DEFAULT 0` | `messages` | Lists sent messages. |
| `get_public_profile` | `profile_id uuid` | `json` | Retrieves a public profile JSON view. |
| `get_public_profiles` | — | `jsonb` | Returns all public profiles. |
| `get_threads` | `p_limit integer DEFAULT 50, p_offset integer DEFAULT 0` | `record` | Retrieves paginated discussion threads. |
| `get_user_project_ids` | `p_user uuid` | `uuid` | Returns all project IDs belonging to a user. |
| `get_users_for_feedback_email` | — | `text` | Returns list of users for feedback mailing. |
| `handle_new_user_with_waitlist` | — | `trigger` | Trigger: creates profile and manages waitlist entries on new Auth user. |
| `handle_updated_at` | — | `trigger` | Trigger: updates timestamp on modified rows. |
| `handle_waitlist_signup` | — | `trigger` | Trigger: handles logic when a waitlist entry is inserted. |
| `insert_follow` | `target_id uuid` | `void` | Creates a new follow relationship. |
| `is_project_member` | `p_project_id uuid` | `bool` | Checks if current user is a member of the project. |
| `mark_read` | `p_message_id uuid` | `void` | Marks a message as read. |
| `messages_guard_update` | — | `trigger` | Prevents unauthorized message updates. |
| `normalize_waitlist_email` | — | `trigger` | Ensures waitlist emails are lowercase and normalized. |
| `notify_project_members` | `p_project_id uuid, p_actor uuid, p_kind text, p_payload jsonb` | `void` | Sends notifications to project members. |
| `prevent_post_identity_change` | — | `trigger` | Prevents changing author/profile association. |
| `send_message` | `p_recipient_id uuid, p_body text` | `messages` | Sends a new message record. |
| `set_author_id` | — | `trigger` | Sets `auth.uid()` as author before insert. |
| `set_updated_at` | — | `trigger` | Updates the `updated_at` column on record change. |
| `touch_updated_at` | — | `trigger` | Common helper to auto-update timestamps. |
| `update_project_files_updated_at` | — | `trigger` | Keeps file metadata timestamps in sync. |
| `update_thread_like_count` | — | `trigger` | Updates thread’s like counter after insert/delete. |

🧠 **Notes**
- Functions returning `trigger` are not callable via Supabase RPC — they are attached to table triggers.  
- “get_” and “create_” functions are typically callable RPCs accessible via the Supabase client.  

---

## ⚙️ storage schema

| Function | Arguments | Returns | Purpose |
|-----------|------------|----------|----------|
| `add_prefixes` | `_bucket_id text, _name text` | `void` | Internal prefix creation helper. |
| `can_insert_object` | `bucketid text, name text, owner uuid, metadata jsonb` | `void` | Checks permissions and constraints before inserting storage objects. |
| `delete_leaf_prefixes` | `bucket_ids text[], names text[]` | `void` | Cleans up leaf prefixes after deletion. |
| `delete_prefix` | `_bucket_id text, _name text` | `bool` | Deletes a prefix path from storage. |
| `delete_prefix_hierarchy_trigger` | — | `trigger` | Maintains hierarchy when prefixes are deleted. |
| `enforce_bucket_name_length` | — | `trigger` | Ensures bucket names meet length constraints. |
| `extension` | `name text` | `text` | Returns file extension from name. |
| `filename` | `name text` | `text` | Returns filename portion. |
| `foldername` | `name text` | `_text` | Returns folder hierarchy. |
| `get_level` | `name text` | `int4` | Returns folder depth. |
| `get_prefix` | `name text` | `text` | Returns prefix portion of object name. |
| `get_prefixes` | `name text` | `_text` | Returns all prefixes for an object. |
| `get_size_by_bucket` | — | `record` | Calculates bucket sizes. |
| `list_multipart_uploads_with_delimiter` | `bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT '', next_upload_token text DEFAULT ''` | `record` | Lists multipart uploads (v2). |
| `list_objects_with_delimiter` | `bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT '', next_token text DEFAULT ''` | `record` | Lists objects with pagination and delimiters. |
| `lock_top_prefixes` | `bucket_ids text[], names text[]` | `void` | Locks top prefixes for integrity. |
| `objects_delete_cleanup` | — | `trigger` | Cleans up dependent storage metadata after delete. |
| `objects_insert_prefix_trigger` | — | `trigger` | Ensures prefix hierarchy exists on insert. |
| `objects_update_cleanup` | — | `trigger` | Cleans up metadata after updates. |
| `objects_update_level_trigger` | — | `trigger` | Updates nesting level of objects. |
| `objects_update_prefix_trigger` | — | `trigger` | Maintains prefix tree on rename. |
| `operation` | — | `text` | Returns operation type string. |
| `prefixes_delete_cleanup` | — | `trigger` | Deletes orphaned prefix rows. |
| `prefixes_insert_trigger` | — | `trigger` | Maintains hierarchy when prefix inserted. |
| `search` | `prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT '', sortcolumn text DEFAULT 'name', sortorder text DEFAULT 'asc'` | `record` | Searches objects with filters and sorting. |
| `search_legacy_v1` | same as `search` | `record` | Legacy search implementation. |
| `search_v1_optimised` | same as `search` | `record` | Optimised legacy search. |
| `search_v2` | `prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT '', sort_order text DEFAULT 'asc', sort_column text DEFAULT 'name', sort_column_after text DEFAULT ''` | `record` | Latest search implementation. |
| `update_updated_at_column` | — | `trigger` | Automatically updates `updated_at` column for storage objects. |

---

## 🧠 Summary

- Total functions: **~75** (includes Supabase storage internals).  
- All `trigger` functions are invoked automatically by database triggers.  
- Functions returning table types (`messages`, `projects`, etc.) are callable via Supabase RPCs from your app.  
- Use the `public` schema functions in your client code; `admin` and `storage` are server/internal use.

---

