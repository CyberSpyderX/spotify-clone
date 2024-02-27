import { RealtimeChannel } from "@supabase/supabase-js";
import { create } from "zustand";

interface PlaybackChannelStore {
    playbackChannel: RealtimeChannel | null;
    setPlaybackChannel: (channel: RealtimeChannel) => void;
}

export const usePlaybackChannel = create<PlaybackChannelStore>((set) => ({
   playbackChannel: null,
   setPlaybackChannel: (channel: RealtimeChannel) => set({ playbackChannel: channel }),
}));