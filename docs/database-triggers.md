# Quillaborn — Database Triggers

_Last exported from Supabase using `SELECT * FROM information_schema.triggers`._

This document lists all active **database triggers** across the Supabase schemas (`auth`, `public`, `realtime`, and `storage`).  
Each trigger defines an automatic database action that executes a specific function on insert, update, or delete events.

---

## ⚙️ auth schema

| Table | Trigger | Timing | Event | Function |
|--------|----------|---------|--------|-----------|
| `users` | on_auth_user_created | AFTER | INSERT | `handle_new_user_with_waitlist()` |
| `users` | trg_handle_new_user_with_waitlist | AFTER | INSERT | `handle_new_user_with_waitlist()` |

🧠 **Purpose:** Automatically creates a linked profile and handles waitlist logic when a new Supabase Auth user is created.

---

## ⚙️ public schema

| Table | Trigger | Timing | Event | Function |
|--------|----------|---------|--------|-----------|
| `cards` | trg_cards_touch | BEFORE | UPDATE | `touch_updated_at()` |
| `community_likes` | thread_likes_update | AFTER | INSERT / DELETE | `update_thread_like_count()` |
| `messages` | trg_messages_guard_update | BEFORE | UPDATE | `messages_guard_update()` |
| `profile_posts` | trg_protect_post_identity | BEFORE | UPDATE | `prevent_post_identity_change()` |
| `profile_posts` | trg_touch_updated_at | BEFORE | UPDATE | `touch_updated_at()` |
| `profiles` | on_profile_update | BEFORE | UPDATE | `handle_updated_at()` |
| `project_chat_messages` | trg_chat_notify | AFTER | INSERT | `_chat_notify()` |
| `project_files` | project_files_updated_at | BEFORE | UPDATE | `update_project_files_updated_at()` |
| `project_invites` | project_invites_set_updated_at | BEFORE | UPDATE | `set_updated_at()` |
| `project_updates` | trg_set_author_id | BEFORE | INSERT | `set_author_id()` |
| `project_updates` | trg_updates_touch | BEFORE | UPDATE | `touch_updated_at()` |
| `project_updates` | trg_update_notify | AFTER | INSERT | `_update_notify()` |
| `projects` | trg_projects_touch | BEFORE | UPDATE | `touch_updated_at()` |
| `waitlist` | trg_normalize_waitlist_email | BEFORE | INSERT / UPDATE | `normalize_waitlist_email()` |
| `waitlist` | trg_handle_waitlist_signup | BEFORE | INSERT | `handle_waitlist_signup()` |
| `waitlist` | on_waitlist_created | AFTER | INSERT | `handle_waitlist_signup()` |

🧠 **Purpose summary:**
- **touch_updated_at():** Maintains updated timestamps automatically.  
- **set_author_id():** Assigns `auth.uid()` to new content.  
- **normalize_waitlist_email():** Ensures consistent lowercase waitlist emails.  
- **handle_waitlist_signup():** Sends notifications or creates approval tokens for new waitlist entries.  
- **_chat_notify() / _update_notify():** Push real-time notifications for chat and updates.  
- **prevent_post_identity_change():** Prevents changing author/profile linkage on existing posts.  

---

## ⚙️ realtime schema

| Table | Trigger | Timing | Event | Function |
|--------|----------|---------|--------|-----------|
| `subscription` | tr_check_filters | BEFORE | INSERT / UPDATE | `realtime.subscription_check_filters()` |

🧠 **Purpose:** Ensures valid subscription filters for real-time channels.

---

## ⚙️ storage schema

| Table | Trigger | Timing | Event | Function |
|--------|----------|---------|--------|-----------|
| `buckets` | enforce_bucket_name_length_trigger | BEFORE | INSERT / UPDATE | `storage.enforce_bucket_name_length()` |
| `objects` | objects_update_create_prefix | BEFORE | UPDATE | `storage.objects_update_prefix_trigger()` |
| `objects` | objects_delete_delete_prefix | AFTER | DELETE | `storage.delete_prefix_hierarchy_trigger()` |
| `objects` | objects_insert_create_prefix | BEFORE | INSERT | `storage.objects_insert_prefix_trigger()` |
| `objects` | update_objects_updated_at | BEFORE | UPDATE | `storage.update_updated_at_column()` |
| `prefixes` | prefixes_delete_hierarchy | AFTER | DELETE | `storage.delete_prefix_hierarchy_trigger()` |
| `prefixes` | prefixes_create_hierarchy | BEFORE | INSERT | `storage.prefixes_insert_trigger()` |

🧠 **Purpose summary:**
- Enforces **bucket naming rules** and hierarchical prefix management.  
- Keeps object metadata synchronized with related files.  
- Ensures storage entries reflect the correct parent/child prefix relationships.

---

## 🧩 Notes
- All triggers are defined in Postgres and executed **server-side** (independent of Supabase client SDK).  
- Triggers prefixed with `trg_` or `on_` indicate internal automation.  
- Real-time and storage triggers are managed by Supabase core extensions — avoid modifying them directly.  
- Use `ALTER TABLE ... DISABLE TRIGGER ...` cautiously; many triggers are required for application integrity.

---

