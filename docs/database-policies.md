# Quillaborn — Database Policies

_Last exported from Supabase using `select * from pg_policies`._

This file documents all **Row-Level Security (RLS)** policies currently active in the Supabase instance for both `public` and supporting schemas (`admin`, `storage`).  

Each table below lists **who can perform which actions** and the corresponding `qual` and `with_check` expressions.

---

## 📂 admin.email_log

| Policy | Command | Roles | Description |
|---------|----------|--------|-------------|
| **admin read email_log** | SELECT | authenticated | Only admins or owners can view email logs. |
| **server insert email_log** | INSERT | authenticated | Only admins or owners can insert records. |

---

## 📂 public.badges

| Policy | Command | Roles | Description |
|---------|----------|--------|-------------|
| **Admins create badges** | INSERT | public | Only `admin` or `owner` roles can create badges. |
| **Admins delete badges** | DELETE | public | Only `admin` or `owner` roles can delete badges. |
| **Admins update badges** | UPDATE | public | Only `admin` or `owner` roles can update badges. |
| **Public read access** | SELECT | public | Anyone can read badges. |

---

## 📂 public.boards & board_lists

| Policy | Command | Roles | Description |
|---------|----------|--------|-------------|
| **boards_read_members / lists_read_members** | SELECT | public | Members of the related project can view boards and lists. |
| **boards_write_admins / lists_write_admins** | ALL | public | Project admins or owners can modify boards and lists. |

---

## 📂 public.cards & related tables

| Table | Policy | Command | Roles | Description |
|--------|---------|----------|--------|-------------|
| `cards` | cards_read_members | SELECT | public | Members of related projects can view cards. |
| `cards` | Editors can update/insert/delete cards | ALL | public | Admins, owners, or editors can modify cards. |
| `card_comments` | card_comments_rw_members | ALL | public | Project members can read/write card comments. |
| `card_assignees` | project members can add/remove/view assignees | ALL | authenticated | Project members can manage card assignees. |

---

## 📂 public.community_threads / comments / likes

| Table | Policy | Command | Roles | Description |
|--------|---------|----------|--------|-------------|
| `community_threads` | Users can create/edit/delete own threads | INSERT / UPDATE / DELETE | public | Authenticated users can manage their own threads. |
| `community_threads` | Threads are viewable by all | SELECT | public | Public visibility. |
| `community_comments` | Users can create/delete own comments | INSERT / DELETE | public | Authenticated users only. |
| `community_comments` | Comments are viewable by all | SELECT | public | Public visibility. |
| `community_likes` | Users can like/unlike | INSERT / DELETE | public | Authenticated users. |
| `community_likes` | Likes are viewable by all | SELECT | public | Public visibility. |

---

## 📂 public.profiles

| Policy | Command | Roles | Description |
|---------|----------|--------|-------------|
| **Enable insert for authenticated users** | INSERT | authenticated | Create profile after signup. |
| **Allow users to read/update their own profile** | SELECT / UPDATE | authenticated | Users can view/update only their profile. |
| **Users can find each other (anon sees public)** | SELECT | anon/authenticated | Authenticated users see all; anon sees public only. |
| **Duplicate SELECT policies** | SELECT | authenticated | Various “own profile” selectors for legacy coverage. |

---

## 📂 public.project_***

| Table | Policy | Command | Description |
|--------|---------|----------|-------------|
| `projects` | projects_select_members | SELECT | Project members can view projects. |
| `projects` | Only owner/admin can update/delete | UPDATE / DELETE | Owners or admins only. |
| `project_members` | Invitee can join project when invited | INSERT | Authenticated + valid invite required. |
| `project_members` | owners can update member roles | UPDATE | Owner role required. |
| `project_members` | members_select_membership | SELECT | Members can view membership list. |
| `project_invites` | Owners can send/update/view invites | INSERT / UPDATE / SELECT | Project admins or owners only. |
| `project_chat_messages` | chat_read/write_members | SELECT / INSERT | Project members can read/write chat messages. |
| `project_files` | files_read/write_members | SELECT / INSERT | Members can upload/view files. |
| `project_files` | Uploader or admin can delete/update | DELETE / UPDATE | Owner or uploader only. |
| `project_updates` | updates_read/write_members | SELECT / INSERT | Members can post updates. |
| `project_updates` | updates_edit/delete_author | UPDATE / DELETE | Author-only edits. |

---

## 📂 public.notifications

| Policy | Command | Roles | Description |
|---------|----------|--------|-------------|
| **Allow inserting notifications for others** | INSERT | authenticated | Used for system notifications like project invites. |
| **Allow users to read their own notifications** | SELECT | authenticated | Restricted to user’s own ID. |
| **Recipient update policies** | UPDATE | public | Users can mark their own notifications read. |

---

## 📂 public.follows / messages / waitlist

| Table | Policy | Command | Description |
|--------|---------|----------|-------------|
| `follows` | follows_insert_self / delete_self | INSERT / DELETE | User can follow/unfollow. |
| `messages` | messages_select_self | SELECT | Sender or recipient only. |
| `messages` | messages_insert_sender | INSERT | Authenticated sender only. |
| `waitlist` | Anyone can join waitlist | INSERT | Public inserts allowed. |
| `waitlist` | Users can view own waitlist row | SELECT | Based on JWT email. |
| `waitlist` | admin can select/update waitlist | SELECT / UPDATE | Only admin/owner roles. |

---

## 📂 public.user_badges / roles / interests

| Table | Policy | Command | Description |
|--------|---------|----------|-------------|
| `user_badges` | Admins can assign badges | INSERT | Only admins or owners. |
| `user_badges` | Anyone can read user badges | SELECT | Public access. |
| `roles` | Allow public read access | SELECT | Public / authenticated users. |
| `interests` | Allow public read access | SELECT | Public / authenticated users. |

---

## 📂 storage.objects

| Policy | Command | Description |
|---------|----------|-------------|
| **Project members can read project files** | SELECT | Ensures member access to `project-files` bucket. |
| **Project members can upload project files** | INSERT | Authenticated members only. |
| **Uploader or admin can delete project files** | DELETE | Matches same `is_project_member()` logic as DB. |

---

## 📂 Helper Functions Referenced
These policies rely on helper SQL functions:

| Function | Purpose |
|-----------|----------|
| `is_project_member(project_id)` | Returns true if `auth.uid()` is a member of given project. |
| `auth.uid()` | Returns the currently authenticated user ID. |
| `auth.role()` | Returns current JWT role (`anon`, `authenticated`, etc.). |

---

## 🧠 Notes
- Every table listed here has **RLS = enabled**.
- Policies are **PERMISSIVE**, meaning multiple policies can allow access.
- Supabase service-role key (server-side) bypasses RLS for admin operations.
- Keep this file synced with your database by re-running:

  ```bash
  \! psql -Atc "select schemaname, tablename, policyname, cmd, roles, qual, with_check from pg_policies order by schemaname, tablename" > docs/policies.csv
