import type { SupabaseClient } from '@supabase/supabase-js';

export const sendMessage = (sb: SupabaseClient, recipientId: string, body: string) =>
  sb.rpc('send_message', { p_recipient_id: recipientId, p_body: body });

export const getInbox = (sb: SupabaseClient, limit = 50, offset = 0) =>
  sb.rpc('get_inbox', { p_limit: limit, p_offset: offset });

export const getOutbox = (sb: SupabaseClient, limit = 50, offset = 0) =>
  sb.rpc('get_outbox', { p_limit: limit, p_offset: offset });

export const markRead = (sb: SupabaseClient, messageId: string) =>
  sb.rpc('mark_read', { p_message_id: messageId });
