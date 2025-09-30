"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { Avatar } from "@/components/ui/avatar";
import { Plus, X } from "lucide-react";
import type { Profile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

type CardDetailsModalProps = {
  cardId: string | null;
  onClose: () => void;
  role: "owner" | "admin" | "editor" | "viewer"; // 🔑 role passed in
};

type Card = {
  id: string;
  title: string;
  description?: string | null;
  due_at?: string | null;
  board_list_id?: string;
};

type Assignee = {
  userId: string;
  profile: Profile;
};

type Member = {
  userId: string;
  profile: Profile;
};

type Comment = {
  id: string;
  body: string;
  created_at: string;
  author: Profile;
};

// ---- helpers ---------------------------------------------------------------
function makePlaceholderProfile(userId: string, username = "User"): Profile {
  return {
    id: userId,
    username,
    display_name: username,
    created_at: new Date().toISOString(),
    email: "",
    avatar_key: null,
    avatar_url: null,
    avatar_kind: "preset",
    bio: null,
    pronouns: null,
    onboarding_complete: false,
  } as Profile;
}

function coerceProfile(input: any, fallbackId = "unknown", fallbackName = "Unknown"): Profile {
  const p = Array.isArray(input) ? input[0] : input;
  if (!p) return makePlaceholderProfile(fallbackId, fallbackName);
  return {
    id: String(p.id ?? fallbackId),
    username: String(p.username ?? fallbackName),
    display_name: String(p.display_name ?? p.username ?? fallbackName),
    created_at: String(p.created_at ?? new Date().toISOString()),
    email: String(p.email ?? ""),
    avatar_key: p.avatar_key ?? null,
    avatar_url: p.avatar_url ?? null,
    avatar_kind: String(p.avatar_kind ?? "preset"),
    bio: p.bio ?? null,
    pronouns: p.pronouns ?? null,
    onboarding_complete: Boolean(p.onboarding_complete ?? false),
  } as Profile;
}

// ---- component -------------------------------------------------------------
export default function CardDetailsModal({ cardId, onClose, role }: CardDetailsModalProps) {
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [assigneePickerOpen, setAssigneePickerOpen] = useState(false);

  const canEdit = role === "owner" || role === "admin" || role === "editor";

  // --- fetch data ---
  useEffect(() => {
    if (!cardId) return;
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);

        const { data: cardData } = await supabase
          .from("cards")
          .select("id, title, description, due_at, board_list_id")
          .eq("id", cardId)
          .single();
        if (!cancelled) setCard(cardData ?? null);

        const { data: rawAssignees } = await supabase
          .from("card_assignees")
          .select("user_id, profiles(*)")
          .eq("card_id", cardId);

        if (!cancelled) {
          setAssignees(
            (rawAssignees ?? []).map((row: any) => ({
              userId: String(row.user_id),
              profile: coerceProfile(row.profiles, row.user_id),
            }))
          );
        }

        const { data: rawComments } = await supabase
          .from("card_comments")
          .select("id, body, created_at, profiles(*)")
          .eq("card_id", cardId)
          .order("created_at", { ascending: true });

        if (!cancelled) {
          setComments(
            (rawComments ?? []).map((row: any) => ({
              id: String(row.id),
              body: String(row.body ?? ""),
              created_at: String(row.created_at ?? new Date().toISOString()),
              author: coerceProfile(row.profiles),
            }))
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [cardId, supabase]);

  // --- actions ---
  async function handleSave() {
    if (!canEdit || !card) return;
    const { error } = await supabase
      .from("cards")
      .update({
        title: card.title,
        description: card.description ?? null,
        due_at: card.due_at ? card.due_at : null,
      })
      .eq("id", card.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save card." });
    } else {
      toast({ title: "Card updated", description: "Your changes were saved." });
      onClose();
    }
  }

  async function handleAddAssignee(userId: string) {
    if (!canEdit || !card) return false;
    await supabase.from("card_assignees").insert([{ card_id: card.id, user_id: userId }]);
    const member = members.find((m) => m.userId === userId);
    setAssignees((prev) => [...prev, { userId, profile: member?.profile ?? makePlaceholderProfile(userId) }]);
    return true;
  }

  async function handleRemoveAssignee(userId: string) {
    if (!canEdit || !card) return;
    await supabase.from("card_assignees").delete().eq("card_id", card.id).eq("user_id", userId);
    setAssignees((prev) => prev.filter((a) => a.userId !== userId));
  }

  async function handleAddComment() {
    if (!card || !newComment.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("card_comments")
      .insert([{ card_id: card.id, author_id: user?.id, body: newComment }])
      .select("id, body, created_at, profiles(*)")
      .single();

    if (data) {
      setComments((prev) => [
        ...prev,
        {
          id: String(data.id),
          body: String(data.body ?? ""),
          created_at: String(data.created_at ?? new Date().toISOString()),
          author: coerceProfile((data as any).profiles, user?.id ?? "unknown", "You"),
        },
      ]);
      setNewComment("");
    }
  }

  if (!cardId) return null;

  // --- render ---
  return (
    <Dialog open={!!cardId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby="card-details-description">
        <DialogHeader>
          <DialogTitle>Card Details</DialogTitle>
        </DialogHeader>
        <DialogDescription id="card-details-description">
          View or edit card details
        </DialogDescription>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="card-title" className="block text-sm mb-1">Title</label>
              <Input
                id="card-title"
                value={card?.title || ""}
                onChange={(e) => canEdit && setCard({ ...(card as Card), title: e.target.value })}
                readOnly={!canEdit}
                placeholder="Enter card title"
                className="bg-gray-800 border border-gray-700 text-white placeholder-gray-400"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="card-description" className="block text-sm mb-1">Description</label>
              <textarea
                id="card-description"
                value={card?.description || ""}
                onChange={(e) => canEdit && setCard({ ...(card as Card), description: e.target.value })}
                readOnly={!canEdit}
                rows={4}
                placeholder="Enter card description"
                className="w-full rounded-md bg-gray-800 border border-gray-700 text-white p-2 placeholder-gray-400"
              />
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="card-due-date" className="block text-sm mb-1">Due Date</label>
              <Input
                id="card-due-date"
                type="date"
                value={card?.due_at ? String(card.due_at).split("T")[0] : ""}
                onChange={(e) => canEdit && setCard({ ...(card as Card), due_at: e.target.value || null })}
                readOnly={!canEdit}
                placeholder="Select due date"
                className="bg-gray-800 border border-gray-700 text-white"
              />
            </div>

            {/* Assignees */}
            <div>
              <label className="block text-sm mb-2">Assignees</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {assignees.map((a) => (
                  <div key={a.userId} className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-full">
                    <Avatar profile={a.profile} size={6} alt={a.profile.username} />
                    <span className="text-xs">{a.profile.username}</span>
                    {canEdit && (
                      <button
                        className="text-red-400 hover:text-red-500"
                        onClick={() => handleRemoveAssignee(a.userId)}
                        aria-label={`Remove ${a.profile.username}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {canEdit && (
                <Popover open={assigneePickerOpen} onOpenChange={setAssigneePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-gray-800 text-gray-300"
                      aria-label="Add assignee"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Assignee
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="bg-gray-900 border border-gray-700 rounded-lg p-2 w-56">
                    {members
                      .filter((m) => !assignees.some((a) => a.userId === m.userId))
                      .map((m) => (
                        <button
                          key={m.userId}
                          type="button"
                          className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-700"
                          onClick={async () => {
                            const ok = await handleAddAssignee(m.userId);
                            if (ok) setAssigneePickerOpen(false);
                          }}
                        >
                          <Avatar profile={m.profile} size={6} alt={m.profile.username} />
                          <span className="text-sm">{m.profile.username}</span>
                        </button>
                      ))}
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm mb-2" htmlFor="new-comment">Comments</label>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-2 items-start">
                    <Avatar profile={c.author} size={6} alt={c.author.username} />
                    <div>
                      <p className="text-sm text-white">{c.body}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(c.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-xs text-gray-400 italic">No comments yet.</p>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  id="new-comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="bg-gray-800 border border-gray-700 text-white"
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  aria-label="Add comment"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            className="bg-green-500 hover:bg-green-600 text-black font-semibold"
            onClick={onClose}
            aria-label="Close card details"
          >
            Close
          </Button>
          {canEdit && (
            <Button
              className="bg-green-700 hover:bg-green-800 text-white font-semibold"
              onClick={handleSave}
              aria-label="Save card changes"
            >
              Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
