"use client";

import { useEffect, useMemo, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useNotifications } from "@/components/providers/NotificationsProvider"; // NEW
import { Avatar } from "@/components/ui/avatar";
import { Loader2, Send, X } from "lucide-react";

type ThreadRow = {
  partner_id: string;
  last_message_id: string;
  last_message_body: string;
  last_message_at: string;
  last_sender_id: string;
  last_message_read_at: string | null;
  unread_count: number;
};

type MiniProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_kind?: string | null;
  avatar_key?: string | null;
  avatar_path?: string | null;
  avatar_url?: string | null;
};

type MessageRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

const PAGE_SIZE = 20;

// RPC helpers
const rpcGetThreads = (sb: any, limit = PAGE_SIZE, offset = 0) =>
  sb.rpc("get_threads", { p_limit: limit, p_offset: offset });
const rpcMarkRead = (sb: any, id: string) =>
  sb.rpc("mark_read", { p_message_id: id });
const rpcSend = (sb: any, recipientId: string, body: string) =>
  sb.rpc("send_message", { p_recipient_id: recipientId, p_body: body });

type Filter = "all" | "unread" | "from_me";

export default function MessagesPage() {
  const { supabase, user } = useSupabase();
  const { setUnreadMessages } = useNotifications(); // NEW

  // Conversations list
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, MiniProfile>>({});
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  // Ephemeral glow for newly-arrived threads
  const [flashThreads, setFlashThreads] = useState<Record<string, true>>({});

  // Open thread state
  const [openWith, setOpenWith] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [busyThread, setBusyThread] = useState(false);
  const [reply, setReply] = useState("");
  // Ephemeral glow for newly-arrived message bubbles
  const [flashMsgs, setFlashMsgs] = useState<Record<string, true>>({});

  const fmt = useMemo(
    () => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }),
    []
  );

  // Derived: filtered threads
  const visibleThreads = useMemo(() => {
    const me = user?.id;
    return threads.filter((t) =>
      filter === "unread" ? (t.unread_count ?? 0) > 0 :
      filter === "from_me" ? t.last_sender_id === me :
      true
    );
  }, [threads, filter, user?.id]);

  // Keep global unread badge (sidebar) in sync
  useEffect(() => {
    const totalUnread = threads.reduce((sum, t) => sum + (t.unread_count ?? 0), 0);
    setUnreadMessages(totalUnread);
  }, [threads, setUnreadMessages]);

  // Fetch conversations page
  const fetchThreads = async (append: boolean) => {
    if (!user) return;
    const nextPage = append ? page + 1 : 0;
    append ? setLoadingMore(true) : setLoading(true);

    const { data, error } = await rpcGetThreads(supabase, PAGE_SIZE, nextPage * PAGE_SIZE);
    if (error) {
      console.error("threads load error:", error);
      append ? setLoadingMore(false) : setLoading(false);
      return;
    }
    const rows: ThreadRow[] = (data ?? []) as any[];

    setThreads((prev) => {
      const merged = append ? [...prev, ...rows] : rows;
      const seen = new Set<string>();
      return merged.filter((t) => {
        if (seen.has(t.partner_id)) return false;
        seen.add(t.partner_id);
        return true;
      });
    });

    setPage(nextPage);
    setHasMore(rows.length === PAGE_SIZE);

    // Prefetch partner profiles
    const need = rows.map((r) => r.partner_id).filter((id) => id && !profiles[id]);
    if (need.length) {
      const { data: profs, error: pErr } = await supabase
        .from("user_profiles_public")
        .select("id, username, display_name, avatar_kind, avatar_key, avatar_path, avatar_url")
        .in("id", need);
      if (!pErr) {
        setProfiles((prev) => {
          const next = { ...prev };
          (profs ?? []).forEach((p: any) => (next[p.id] = p as MiniProfile));
          return next;
        });
      }
    }

    append ? setLoadingMore(false) : setLoading(false);
  };

  // Initial load
  useEffect(() => {
    setThreads([]);
    setProfiles({});
    setPage(0);
    setHasMore(true);
    fetchThreads(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, user?.id]);

  // Realtime: inbound & outbound inserts
  useEffect(() => {
    if (!user) return;

    // Inbound (I am recipient)
    const inbound = supabase
      .channel("rt-msg-inbound:" + user.id)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${user.id}` },
        async (payload: any) => {
          const m = payload.new as MessageRow;

          // Glow + NEW on the thread row
          setFlashThreads((prev) => ({ ...prev, [m.sender_id]: true }));
          setTimeout(() => {
            setFlashThreads((prev) => {
              const { [m.sender_id]: _, ...rest } = prev;
              return rest;
            });
          }, 4000);

          // bump/insert thread
          setThreads((prev) => {
            const others = prev.filter((t) => t.partner_id !== m.sender_id);
            const existing = prev.find((t) => t.partner_id === m.sender_id);
            const unreadInc = openWith === m.sender_id ? 0 : 1;
            const newRow: ThreadRow = existing
              ? {
                  ...existing,
                  last_message_id: m.id,
                  last_message_body: m.body,
                  last_message_at: m.created_at,
                  last_sender_id: m.sender_id,
                  last_message_read_at: m.read_at,
                  unread_count: (existing.unread_count ?? 0) + unreadInc,
                }
              : {
                  partner_id: m.sender_id,
                  last_message_id: m.id,
                  last_message_body: m.body,
                  last_message_at: m.created_at,
                  last_sender_id: m.sender_id,
                  last_message_read_at: m.read_at,
                  unread_count: unreadInc,
                };
            return [newRow, ...others];
          });

          // cache sender profile if needed
          if (m.sender_id && !profiles[m.sender_id]) {
            const { data } = await supabase
              .from("user_profiles_public")
              .select("id, username, display_name, avatar_kind, avatar_key, avatar_path, avatar_url")
              .eq("id", m.sender_id)
              .maybeSingle();
            if (data) setProfiles((prev) => ({ ...prev, [m.sender_id]: data as MiniProfile }));
          }

          // If thread open with sender: append + mark read + flash bubble
          if (openWith === m.sender_id) {
            setMessages((prev) => [...prev, m]);
            setFlashMsgs((prev) => ({ ...prev, [m.id]: true }));
            setTimeout(() => {
              setFlashMsgs((prev) => {
                const { [m.id]: _, ...rest } = prev;
                return rest;
              });
            }, 4000);

            await rpcMarkRead(supabase, m.id);
            setThreads((prev) =>
              prev.map((t) => (t.partner_id === m.sender_id ? { ...t, unread_count: 0 } : t))
            );
          }
        }
      )
      .subscribe();

    // Outbound (I am sender)
    const outbound = supabase
      .channel("rt-msg-outbound:" + user.id)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `sender_id=eq.${user.id}` },
        (payload: any) => {
          const m = payload.new as MessageRow;
          setThreads((prev) => {
            const others = prev.filter((t) => t.partner_id !== m.recipient_id);
            const existing = prev.find((t) => t.partner_id === m.recipient_id);
            const newRow: ThreadRow = existing
              ? {
                  ...existing,
                  last_message_id: m.id,
                  last_message_body: m.body,
                  last_message_at: m.created_at,
                  last_sender_id: m.sender_id,
                  last_message_read_at: m.read_at,
                }
              : {
                  partner_id: m.recipient_id,
                  last_message_id: m.id,
                  last_message_body: m.body,
                  last_message_at: m.created_at,
                  last_sender_id: m.sender_id,
                  last_message_read_at: m.read_at,
                  unread_count: 0,
                };
            return [newRow, ...others];
          });
          if (openWith === m.recipient_id) {
            setMessages((prev) => [...prev, m]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(inbound);
      supabase.removeChannel(outbound);
    };
  }, [supabase, user, openWith, profiles]);

  // Open a thread
  const openThread = async (partnerId: string) => {
    if (!user) return;
    setOpenWith(partnerId);
    setBusyThread(true);
    setReply("");

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true })
      .limit(300);

    if (error) {
      console.error("thread load error:", error);
      setMessages([]);
      setBusyThread(false);
      return;
    }

    const rows = (data ?? []) as MessageRow[];
    setMessages(rows);
    setBusyThread(false);

    // mark unread inbound as read & update thread row
    const unreadInbound = rows.filter((m) => m.recipient_id === user.id && !m.read_at);
    if (unreadInbound.length) {
      await Promise.all(unreadInbound.map((m) => rpcMarkRead(supabase, m.id)));
      setThreads((prev) =>
        prev.map((t) => (t.partner_id === partnerId ? { ...t, unread_count: 0 } : t))
      );
    }

    // ensure profile cached
    if (partnerId && !profiles[partnerId]) {
      const { data: prof } = await supabase
        .from("user_profiles_public")
        .select("id, username, display_name, avatar_kind, avatar_key, avatar_path, avatar_url")
        .eq("id", partnerId)
        .maybeSingle();
      if (prof) setProfiles((prev) => ({ ...prev, [partnerId]: prof as MiniProfile }));
    }
  };

  const closeThread = () => {
    setOpenWith(null);
    setMessages([]);
    setReply("");
  };

  const sendReply = async () => {
    if (!user || !openWith) return;
    const text = reply.trim();
    if (!text) return;
    const { data, error } = await rpcSend(supabase, openWith, text);
    if (error) {
      console.error("send error:", error);
      return;
    }
    const newMsg = data as MessageRow;
    setMessages((prev) => [...prev, newMsg]);
    // optimistic bump (outbound realtime will also handle)
    setThreads((prev) => {
      const others = prev.filter((t) => t.partner_id !== openWith);
      const existing = prev.find((t) => t.partner_id === openWith);
      const updated: ThreadRow = existing
        ? {
            ...existing,
            last_message_id: newMsg.id,
            last_message_body: newMsg.body,
            last_message_at: newMsg.created_at,
            last_sender_id: newMsg.sender_id,
            last_message_read_at: newMsg.read_at,
          }
        : {
            partner_id: openWith,
            last_message_id: newMsg.id,
            last_message_body: newMsg.body,
            last_message_at: newMsg.created_at,
            last_sender_id: newMsg.sender_id,
            last_message_read_at: newMsg.read_at,
            unread_count: 0,
          };
      return [updated, ...others];
    });
    setReply("");
  };

  const onLoadMore = () => fetchThreads(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Conversations</h1>
        {/* Filters */}
        <div className="inline-flex gap-2">
          {(["all", "unread", "from_me"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                filter === f
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600"
              }`}
            >
              {f === "all" ? "All" : f === "unread" ? "Unread" : "From me"}
            </button>
          ))}
        </div>
      </div>

      {/* Threads list */}
      <div className="bg-gray-900/60 rounded-xl border border-gray-800">
        {loading && visibleThreads.length === 0 ? (
          <div className="flex items-center justify-center p-12 text-gray-400">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading…
          </div>
        ) : visibleThreads.length === 0 ? (
          <div className="p-8 text-gray-400">No conversations yet.</div>
        ) : (
          <ul className="divide-y divide-gray-800">
            {visibleThreads.map((t) => {
              const p = profiles[t.partner_id];
              const title = p?.display_name || p?.username || "Unknown";
              const handle = p?.username ? `@${p.username}` : "";
              const mine = t.last_sender_id === user?.id;
              const snippet = `${mine ? "You: " : ""}${t.last_message_body ?? ""}`;
              const unread = (t.unread_count ?? 0) > 0;
              const glow = !!flashThreads[t.partner_id] && unread; // glow only when unread & just arrived
              return (
                <li
                  key={t.partner_id}
                  className={`p-4 cursor-pointer transition ${
                    glow
                      ? "bg-emerald-500/10 ring-1 ring-emerald-500/40 animate-pulse"
                      : "hover:bg-gray-800/60"
                  }`}
                  onClick={() => openThread(t.partner_id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar profile={p as any} alt={title} size={10} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate flex items-center gap-2">
                          <div className="text-sm font-semibold truncate">{title}</div>
                          {unread && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600/30 border border-emerald-500/40 text-emerald-100">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 whitespace-nowrap">
                          {fmt.format(new Date(t.last_message_at))}
                        </div>
                      </div>
                      <div className={`mt-1 text-sm ${unread ? "text-white" : "text-gray-300"} line-clamp-2`}>
                        {snippet}
                      </div>
                      {mine && (
                        <div className="mt-1 text-xs text-gray-400">
                          {t.last_message_read_at ? "Read" : "Sent"}
                        </div>
                      )}
                    </div>
                    {unread && (
                      <span className="ml-2 mt-1 inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full bg-emerald-600/30 text-emerald-200 border border-emerald-500/40">
                        {t.unread_count}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-gray-900 font-semibold inline-flex items-center gap-2"
          >
            {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
            Load more
          </button>
        </div>
      )}

      {/* Slide-over thread */}
      {openWith && (
        <ThreadSlideOver
          partner={profiles[openWith]}
          partnerId={openWith}
          messages={messages}
          busy={busyThread}
          fmt={fmt}
          reply={reply}
          setReply={setReply}
          onClose={closeThread}
          onSend={sendReply}
          userId={user!.id}
          flashMsgs={flashMsgs}
        />
      )}
    </div>
  );
}

/* ---------- Slide-over + thread view ---------- */

function ThreadSlideOver({
  partner,
  partnerId,
  messages,
  busy,
  fmt,
  reply,
  setReply,
  onClose,
  onSend,
  userId,
  flashMsgs,
}: {
  partner?: MiniProfile;
  partnerId: string;
  messages: MessageRow[];
  busy: boolean;
  fmt: Intl.DateTimeFormat;
  reply: string;
  setReply: (v: string) => void;
  onClose: () => void;
  onSend: () => void;
  userId: string;
  flashMsgs: Record<string, true>;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[520px] bg-gray-900 border-l border-gray-800 flex flex-col">
        {/* header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar profile={partner as any} alt="Partner" size={10} />
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">
                {partner?.display_name || partner?.username || "Conversation"}
              </div>
              {partner?.username && (
                <div className="text-xs text-gray-400 truncate">@{partner.username}</div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-gray-800 hover:bg-gray-800 text-gray-300"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {busy && messages.length === 0 ? (
            <div className="flex items-center justify-center text-gray-400 h-full">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading conversation…
            </div>
          ) : messages.length === 0 ? (
            <div className="text-gray-400 text-sm">No messages yet. Say hello!</div>
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === userId;
              const glow = !!flashMsgs[m.id] && !mine; // glow only for new inbound
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm border ${
                      mine
                        ? "bg-green-600/20 border-green-500/40"
                        : glow
                        ? "bg-emerald-700/20 border-emerald-500/40 ring-1 ring-emerald-500/40 animate-pulse"
                        : "bg-gray-800 border-gray-700"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.body}</div>
                    <div className="mt-1 text-[10px] text-gray-400 text-right">
                      {fmt.format(new Date(m.created_at))} {mine && (m.read_at ? "· Read" : "· Sent")}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* composer */}
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-end gap-2">
            <textarea
              className="flex-1 resize-none rounded-xl bg-gray-800 border border-gray-700 p-2 text-sm text-gray-100"
              rows={3}
              placeholder={`Message ${partner?.display_name || partner?.username || "user"}…`}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
            <button
              onClick={onSend}
              disabled={busy || reply.trim().length === 0}
              className="h-10 px-4 rounded-xl bg-green-500 hover:bg-green-600 text-gray-900 font-semibold inline-flex items-center gap-2 disabled:opacity-60"
              title="Send"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
