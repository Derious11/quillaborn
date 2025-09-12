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
  userId: string; // auth.users.id
  profile: Profile; // corresponding profiles row
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
    // add any other optional fields your Profile type expects with safe defaults
  } as Profile;
}

/**
 * Supabase can return a joined relation as an object or an array (depending on FK shape).
 * This normalizes it to a single Profile so TS stops complaining.
 */
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

export default function CardDetailsModal({ cardId, onClose }: CardDetailsModalProps) {
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [assigneePickerOpen, setAssigneePickerOpen] = useState(false);

  useEffect(() => {
    if (!cardId) return;
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);

        // Card
        const { data: cardData, error: cardErr } = await supabase
          .from("cards")
          .select("id, title, description, due_at, board_list_id")
          .eq("id", cardId)
          .single();
        if (cardErr) console.error(cardErr);
        if (!cancelled) setCard(cardData ?? null);

        // Assignees (FK -> profiles now; still normalize in case it returns an array)
        const { data: rawAssignees, error: assErr } = await supabase
          .from("card_assignees")
          .select("user_id, profiles(*)")
          .eq("card_id", cardId);
        if (assErr) console.error(assErr);

        const normalizedAssignees: Assignee[] = (rawAssignees ?? []).map((row: any) => ({
          userId: String(row.user_id),
          profile: coerceProfile(row.profiles, row.user_id),
        }));
        if (!cancelled) setAssignees(normalizedAssignees);

        // Comments (FK -> profiles; normalize)
        const { data: rawComments, error: comErr } = await supabase
          .from("card_comments")
          .select("id, body, created_at, profiles(*)")
          .eq("card_id", cardId)
          .order("created_at", { ascending: true });
        if (comErr) console.error(comErr);

        const normalizedComments: Comment[] = (rawComments ?? []).map((row: any) => ({
          id: String(row.id),
          body: String(row.body ?? ""),
          created_at: String(row.created_at ?? new Date().toISOString()),
          author: coerceProfile(row.profiles),
        }));
        if (!cancelled) setComments(normalizedComments);

        // Members (via board_list -> board -> project_members -> profiles)
        if (cardData?.board_list_id) {
          const { data: list } = await supabase
            .from("board_lists")
            .select("board_id")
            .eq("id", cardData.board_list_id)
            .single();

          if (list) {
            const { data: board } = await supabase
              .from("boards")
              .select("project_id")
              .eq("id", list.board_id)
              .single();

            if (board) {
              const { data: projectMembers, error: memErr } = await supabase
                .from("project_members")
                .select("user_id, profiles(*)")
                .eq("project_id", board.project_id);
              if (memErr) console.error(memErr);

              const normalizedMembers: Member[] = (projectMembers ?? []).map((row: any) => ({
                userId: String(row.user_id),
                profile: coerceProfile(row.profiles, row.user_id),
              }));
              if (!cancelled) setMembers(normalizedMembers);
            }
          }
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

  async function handleSave() {
    if (!card) return;
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

  async function handleAddAssignee(userId: string): Promise<boolean> {
    if (!card) {
      console.warn("handleAddAssignee: no card loaded", { userId });
      toast({ variant: "destructive", title: "No card", description: "Card not loaded yet." });
      return false;
    }

    // Prevent duplicate assignment in UI and DB
    if (assignees.some((a) => a.userId === userId)) {
      console.info("handleAddAssignee: already assigned", { userId });
      toast({ title: "Already assigned", description: "This member is already on the card." });
      return true;
    }

    console.log("handleAddAssignee: inserting", { cardId: card.id, userId });
    const { error } = await supabase
      .from("card_assignees")
      .insert([{ card_id: card.id, user_id: userId }]);

    if (error) {
      const code = (error as any)?.code;
      console.error("handleAddAssignee: insert error", { code, error });
      const isUniqueViolation = code === "23505"; // unique (already assigned)
      toast({
        variant: isUniqueViolation ? undefined : "destructive",
        title: isUniqueViolation ? "Already assigned" : "Error",
        description: isUniqueViolation
          ? "This member is already on the card."
          : (error as any)?.message || "Failed to add assignee.",
      });
      if (!isUniqueViolation) return false;
      // If unique violation, we still want UI to reflect assigned state
    }

    const member = members.find((m) => m.userId === userId);
    const prof = member?.profile ?? makePlaceholderProfile(userId);
    setAssignees((prev) => [...prev, { userId, profile: prof }]);
    console.log("handleAddAssignee: success, UI updated");
    toast({ title: "Assignee added", description: "Member assigned to this card." });
    return true;
  }

  async function handleRemoveAssignee(userId: string) {
    if (!card) return;
    const { error } = await supabase
      .from("card_assignees")
      .delete()
      .eq("card_id", card.id)
      .eq("user_id", userId);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to remove assignee." });
      return;
    }
    setAssignees((prev) => prev.filter((a) => a.userId !== userId));
    toast({ title: "Assignee removed", description: "Member removed from this card." });
  }

  async function handleAddComment() {
    if (!card || !newComment.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("card_comments")
      .insert([{ card_id: card.id, author_id: user?.id, body: newComment }])
      .select("id, body, created_at, profiles(*)")
      .single();
      console.log("Insert result", { data, error });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add comment." });
      return;
    }

    if (data) {
      const author = coerceProfile((data as any).profiles, user?.id ?? "unknown", "You");
      setComments((prev) => [
        ...prev,
        {
          id: String((data as any).id),
          body: String((data as any).body ?? ""),
          created_at: String((data as any).created_at ?? new Date().toISOString()),
          author,
        },
      ]);
      toast({ title: "Comment added", description: "Your comment was posted." });
    }
    setNewComment("");
  }

  if (!cardId) return null;

  return (
    <Dialog open={!!cardId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby="card-details-description">
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
        </DialogHeader>
        <DialogDescription id="card-details-description">
          Edit card details, assignees, and comments.
        </DialogDescription>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm mb-1">Title</label>
              <Input
                value={card?.title || ""}
                onChange={(e) => setCard({ ...(card as Card), title: e.target.value })}
                className="bg-gray-800 border border-gray-700 text-white placeholder-gray-400"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm mb-1">Description</label>
              <textarea
                value={card?.description || ""}
                onChange={(e) => setCard({ ...(card as Card), description: e.target.value })}
                rows={4}
                className="w-full rounded-md bg-gray-800 border border-gray-700 text-white p-2 placeholder-gray-400"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm mb-1">Due Date</label>
              <Input
                type="date"
                value={card?.due_at ? String(card.due_at).split("T")[0] : ""}
                onChange={(e) => setCard({ ...(card as Card), due_at: e.target.value || null })}
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
                    <button
                      className="text-red-400 hover:text-red-500"
                      onClick={() => handleRemoveAssignee(a.userId)}
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <Popover open={assigneePickerOpen} onOpenChange={setAssigneePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-gray-800 text-gray-300 border border-gray-600 hover:text-white hover:border-green-400"
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
                        className="w-full text-left flex items-center gap-2 p-2 rounded cursor-pointer transition-colors text-gray-200 hover:text-white bg-transparent hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus-visible:ring-1 focus-visible:ring-green-400 hover:ring-1 hover:ring-green-400"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("assignee option mousedown", { userId: m.userId });
                        }}
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("assignee option click", { userId: m.userId });
                          const ok = await handleAddAssignee(m.userId);
                          if (ok) setAssigneePickerOpen(false);
                        }}
                      >
                        <Avatar profile={m.profile} size={6} alt={m.profile.username} />
                        <span className="text-sm text-gray-200">{m.profile.username}</span>
                      </button>
                    ))}
                </PopoverContent>
              </Popover>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm mb-2">Comments</label>
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
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="bg-gray-800 border border-gray-700 text-white"
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            className="bg-gray-800 text-gray-300 border border-gray-600 hover:text-white hover:border-green-400"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-600 text-black font-semibold"
            onClick={handleSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
