import { create } from "zustand";

export interface PlaybackUser {
    id: string;
    device_type: string;
    device_type_icon: 'iPad' | 'iPhone' | 'Web' | '';
}

interface PlaybackUserStore {
    myUser: PlaybackUser | null;
    users: PlaybackUser[];
    setMyUser: (user: PlaybackUser) => void;
    addUser: (user: PlaybackUser) => void;
    removeUser: (id: string) => void;
    reset: () => void;
}

const usePlaybackUsers = create<PlaybackUserStore>((set) => ({
    myUser: null,
    users: [],
    reset: () => set({ myUser: null, users: [] }),
    setMyUser: (user: PlaybackUser) => set(() => ({ myUser: user })),
    addUser: (user: PlaybackUser) => set(({ users }) => {
        const isUserAlreadyInList = users.some(existingUser => existingUser.id === user.id);
        if (isUserAlreadyInList) {
            return { users };
        }
        return { users: [...users, user] };
    }),
    removeUser: (id: string) => set(({users}) => ({users: [...users.filter((u) => u.id !== id)]})),
}));

export default usePlaybackUsers;