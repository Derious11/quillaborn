import type { SupabaseClient } from '@supabase/supabase-js'

export const insertFollow = (sb: SupabaseClient, targetId: string) =>
  sb.rpc('insert_follow', { target_id: targetId })

export const deleteFollow = (sb: SupabaseClient, targetId: string) =>
  sb.rpc('delete_follow', { target_id: targetId })

export const getFollowers = (sb: SupabaseClient, userId: string, limit = 50, offset = 0) =>
  sb.rpc('get_followers', { p_user_id: userId, p_limit: limit, p_offset: offset })

export const getFollowing = (sb: SupabaseClient, userId: string, limit = 50, offset = 0) =>
  sb.rpc('get_following', { p_user_id: userId, p_limit: limit, p_offset: offset })
