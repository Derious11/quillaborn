"use client";

import { useTransition } from "react";
import { awardBadgeAction } from "./awardBadgeAction";
import { useToast } from "@/hooks/use-toast";

export default function AwardBadgeForm({
  userId,
  badges,
}: {
  userId: string;
  badges: { id: string; name: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const res = await awardBadgeAction(formData);
          if (res?.error) {
            toast({
              title: "Error",
              description: res.error,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Badge awarded",
              description: "The badge has been successfully assigned.",
            });
          }
        });
      }}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="user_id" value={userId} />
      <select
        name="badge_id"
        className="bg-gray-800 border px-2 py-1 rounded text-sm"
        disabled={isPending}
      >
        {badges.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="px-3 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-500 disabled:opacity-50"
      >
        {isPending ? "..." : "Give"}
      </button>
    </form>
  );
}
