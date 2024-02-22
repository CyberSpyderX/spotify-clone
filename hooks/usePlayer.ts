import { create } from "zustand";

interface PlayerStore {
    ids: string[];
    activeId?: string;
    setActiveId: (id: string) => void;
    setIds: (ids: string[]) => void;
    reset: () => void;
}

const usePlayer = create<PlayerStore>((set) => ({
    ids: [],
    activeId: '',
    setActiveId: (id: string) => set({ activeId: id }),
    setIds: (ids: string[]) => set({ ids }),
    reset: () => set({ ids: [], activeId: '' })
}));

export default usePlayer;