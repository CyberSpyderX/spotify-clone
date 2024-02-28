import { Song } from "@/types";

import useAuthModal from "./useAuthModal";
import usePlayer, { PlayerStore } from "./usePlayer";
import { useUser } from "./useUser";
import { useSessionContext } from "@supabase/auth-helpers-react";

const useOnPlay = (songs: Song[]) => {
    const player = usePlayer();
    const authModal = useAuthModal();
    const { user } = useUser();
    const { supabaseClient, session } = useSessionContext();

    const onPlay = (id: string) => {
        if(!user) {
            return authModal.onOpen();
        }
        
        let newState: Partial<PlayerStore> = { 
            activeId: id,
            ids: songs.map(s => s.id),
        };
        if(player.activeDeviceId === '') {
            newState = {...newState, activeDeviceId: player.deviceId}
        }
        player.setNewState(newState);
        supabaseClient.channel(session?.user.email!).send({
            type: 'broadcast',
            event: 'set_player_config',
            payload: {
                originatedBy: player.deviceId,
                ...newState
            }
        });
    }

    return onPlay;
}

export default useOnPlay;