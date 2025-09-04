"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";

export type BadgeRow = {
  badges: { id: string; name: string; description: string; icon_url: string };
  assigned_at?: string | null;
};

export default function BadgeChips({ badges }: { badges: BadgeRow[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState<(BadgeRow["badges"] & { assigned_at?: string | null }) | null>(null);

  if (!badges || badges.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2">
        {badges.map((ub) => (
          <button
            key={ub.badges.id}
            type="button"
            onClick={() => {
              setActive({ ...ub.badges, assigned_at: ub.assigned_at ?? null });
              setIsOpen(true);
            }}
            className="flex items-center gap-2 bg-gray-800/60 rounded-full px-3 py-1 border border-gray-700 hover:border-green-500 hover:bg-gray-700 transition-colors"
            title={(ub.badges.description || '').replace(
              'Awarded to the first 100 members of Quillaborn who complete their bio.',
              'Awarded to the first 100 members of Quillaborn.'
            )}
          >
            {ub.badges.icon_url && (
              <img
                src={ub.badges.icon_url}
                alt={ub.badges.name}
                className="w-6 h-6 rounded-full border border-gray-500"
              />
            )}
            <span className="text-xs text-gray-100 font-medium">
              {ub.badges.name}
            </span>
          </button>
        ))}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-6 space-y-4">
          {active ? (
            <div className="flex items-start gap-4">
              {active.icon_url && (
                <img
                  src={active.icon_url}
                  alt={active.name}
                  className="w-16 h-16 rounded-xl border border-gray-600"
                />
              )}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">{active.name}</h3>
                {active.assigned_at && (
                  <p className="text-sm text-gray-300">
                    Awarded on {new Date(active.assigned_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                )}
                {active.description && (
                  <p className="text-gray-300">
                    {(active.description || '').replace(
                      'Awarded to the first 100 members of Quillaborn who complete their bio.',
                      'Awarded to the first 100 members of Quillaborn.'
                    )}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No badge selected</p>
          )}
          <div className="flex justify-end">
            <button
              className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

