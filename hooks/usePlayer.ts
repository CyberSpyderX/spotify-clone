import { create } from "zustand";
import { useSessionContext } from "@supabase/auth-helpers-react";
export interface PlayerStore {
    ids: string[];
    activeId?: string;
    playing: boolean;
    volume: number;
    shuffle: boolean;
    repeat: 'off' | 'all' | 'one';
    muted: boolean;
    isActiveUser: boolean;
    activePlaybackDeviceId: string;
    setActiveUser: (val: boolean) => void;
    setPlaying: (playing: boolean) => void;
    toggleMuted: () => void;
    setRepeat: () => void;
    toggleShuffle: () => void;
    setVolume: (val: number) => void;
    setActiveId: (id: string) => void;
    setIds: (ids: string[]) => void;
    setNewState: (newState: Partial<PlayerStore>) => void;
    reset: () => void;
}

const usePlayer = create<PlayerStore>((set) => ({
    ids: [],
    activeId: '',
    playing: false,
    volume: 1,
    shuffle: false,
    repeat: 'off',
    muted: false,
    isActiveUser: true,
    activePlaybackDeviceId: '',
    setActiveUser: (val: boolean) => set({ isActiveUser: val}),
    setPlaying: (val: boolean) => set({ playing: val }),
    toggleMuted: () => set((state) => ({ muted: !state.muted })),
    toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })), // TODO: Add change playlist logic
    setRepeat: () => set((state) => { 
        let newState: 'off' | 'all' | 'one' = 'off';
        if(state.repeat === 'off')
            newState = 'all';
        else if(state.repeat === 'all') {
            newState = 'one';
        }
        return { repeat: newState }
    }),
    setVolume: (val: number) => set({ volume: val}),
    setActiveId: (id: string) => set({ activeId: id }),
    setIds: (ids: string[]) => set({ ids }),
    setNewState: (newState: Partial<PlayerStore>) => set(newState),
    reset: () => set({ ids: [], activeId: '' }),
}))

export default usePlayer;