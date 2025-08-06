"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface LegalDocument {
  id: number;
  document_type: string;
  version: string;
  title: string;
  content: string;
  is_latest: boolean;
  published_at: string;
}

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: LegalDocument | null;
}

export default function LegalModal({ isOpen, onClose, document }: LegalModalProps) {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">{document.title}</h2>
            <p className="text-sm text-gray-400">Version {document.version}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: document.content }}
          />
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-800">
          <p className="text-sm text-gray-400">
            Published on {new Date(document.published_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
} 