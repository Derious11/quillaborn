'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SendPushNotificationModal({ open, onClose }: Props) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [sending, setSending] = useState(false);

  const sendNotification = async () => {
    setSending(true);
    const res = await fetch('/api/admin/send-notification', {
      method: 'POST',
      body: JSON.stringify({ title, body, url }),
      headers: { 'Content-Type': 'application/json' },
    });

    setSending(false);
    onClose();

    if (res.ok) {
      toast({ title: 'Notification sent 🎉' });
    } else {
      const data = await res.json();
      toast({ title: 'Failed to send', description: data.error, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-900 border border-gray-700">
          <DialogHeader>
            <DialogTitle>Send Push Notification</DialogTitle>
            <DialogDescription>
            This will send a push to all subscribed users. Use with care.
            </DialogDescription>
          </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-gray-800 text-white"
          />
          <Input
            placeholder="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="bg-gray-800 text-white"
          />
          <Input
            placeholder="Optional URL (e.g. /dashboard)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-gray-800 text-white"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-gray-800 text-white hover:bg-gray-700">Cancel</Button>
          <Button disabled={sending} onClick={sendNotification} className="bg-green-600 text-black hover:bg-green-700">
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
