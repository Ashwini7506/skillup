"use client";
import { create } from "zustand";

interface ChatState {
  open: boolean;
  recipient: { id: string; name: string; image?: string } | null;
  openChat: (r: ChatState["recipient"]) => void;
  closeChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  open: false,
  recipient: null,
  openChat: (recipient) => set({ open: true, recipient }),
  closeChat: () => set({ open: false, recipient: null }),
}));
