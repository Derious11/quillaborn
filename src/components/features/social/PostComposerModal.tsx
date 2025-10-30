"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import TimelineComposer from "@/components/profile/TimelineComposer";
import { X } from "lucide-react";

interface PostComposerModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PostComposerModal({ open, onClose }: PostComposerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg border border-white/10 bg-gradient-to-b from-slate-900 to-black/90 text-white sm:rounded-2xl sm:p-6 p-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-white">Create Post</DialogTitle>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-white/70 hover:text-white hover:bg-white/10"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <DialogDescription className="sr-only">Share an update to your timeline</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <TimelineComposer />
        </div>
      </DialogContent>
    </Dialog>
  );
}
