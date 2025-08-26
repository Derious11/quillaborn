'use client';

import { useState } from 'react';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { sendMessage } from './api';

export default function MessageButton({ recipientId }: { recipientId: string }) {
  const { supabase, user } = useSupabase();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  if (!user || user.id === recipientId) return null;

  const submit = async () => {
    if (!body.trim()) return;
    setBusy(true);
    try {
      await sendMessage(supabase, recipientId, body.trim());
      setBody('');
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="inline-flex">
      <button
        className="px-3 py-1.5 rounded-lg text-sm border border-blue-500/40 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30"
        onClick={() => setOpen(true)}
      >
        Message
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-4 space-y-3">
            <h3 className="font-semibold">New message</h3>
            <textarea
              className="w-full rounded-lg bg-gray-800 border border-gray-700 p-2 text-sm"
              rows={5}
              placeholder="Say hi and share your collab idea…"
              value={body}
              onChange={e => setBody(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-1.5 rounded-lg text-sm border border-gray-700" onClick={() => setOpen(false)}>Cancel</button>
              <button className="px-3 py-1.5 rounded-lg text-sm border border-emerald-500/40 bg-emerald-600/20"
                disabled={busy}
                onClick={submit}
              >
                {busy ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
