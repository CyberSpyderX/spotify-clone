import { create } from "zustand";

export interface PlayerStore {
    ids: string[];
    activeId?: string;
    playing: boolean;
    volume: number;
    shuffle: boolean;
    repeat: 'off' | 'all' | 'one';
    muted: boolean;
    deviceId: string;
    activeDeviceId: string;
    playbackTime: number;
    isActiveUser: boolean;
    askForPlayer: boolean;
    setAskForPlayer: (val: boolean) => void;
    setDeviceId: (id: string) => void;
    setActiveUser: (val: boolean) => void;
    setPlaying: (playing: boolean) => void;
    toggleMuted: () => void;
    setRepeat: () => void;
    toggleShuffle: () => void;
    setVolume: (val: number) => void;
    setActiveId: (id: string) => void;
    setIds: (ids: string[]) => void;
    setNewState: (newState: Partial<PlayerStore>) => void;
    setActiveDeviceId: (id: string) => void;
    reset: () => void;
}

export type BroadcastPlayerStore = Omit<PlayerStore, 
  'setDeviceId'
  | 'setActiveUser'
  | 'setPlaying'
  | 'toggleMuted'
  | 'setRepeat'
  | 'toggleShuffle'
  | 'setVolume'
  | 'setActiveId'
  | 'setIds'
  | 'setNewState'
  | 'reset'
  | 'isActiveUser'
  | 'deviceId'
>;
const usePlayer = create<PlayerStore>((set) => ({
    ids: [],
    activeId: '',
    playing: false,
    volume: 1,
    shuffle: false,
    repeat: 'off',
    muted: false,
    isActiveUser: true,
    deviceId: '',
    activeDeviceId: '',
    playbackTime: 0,
    askForPlayer: false,
    setActiveDeviceId: (id: string) => set({ activeDeviceId: id }), 
    setAskForPlayer: (val: boolean) => set({ askForPlayer: val}),
    setDeviceId: (id: string) => set({ deviceId: id }),
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
    reset: () => set({ ids: [], activeId: '', playing: false, volume: 1, shuffle: false, repeat: 'off', muted: false, isActiveUser: false, activeDeviceId: '', playbackTime: 0}),
}))

export default usePlayer;