import { Song } from "@/types";

import useAuthModal from "./useAuthModal";
import usePlayer from "./usePlayer";
import { useUser } from "./useUser";

const useOnPlay = (songs: Song[]) => {
    const player = usePlayer();
    const authModal = useAuthModal();
    const { user } = useUser();

    const onPlay = (id: string) => {
        if(!user) {
            return authModal.onOpen();
        }
        
        player.setActiveId(id);
        player.setIds(songs.map(s => s.id));
    }

    return onPlay;
}

export default useOnPlay;