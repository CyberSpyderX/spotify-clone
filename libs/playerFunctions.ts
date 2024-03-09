import usePlayer, { PlayerStore } from "@/hooks/usePlayer";
import { RealtimeChannel } from "@supabase/supabase-js";

export function onPlayNext (player: PlayerStore, playbackChannel: RealtimeChannel) {
    if(player.ids.length === 0) {
        return;
    }
    
    const currentIdx = player.ids.findIndex((id) => id === player.activeId);
    const nextSong = player.ids[currentIdx + 1];
    let nextSongId = (!nextSong) ? player.ids[0] : nextSong;

    if(player.shuffle) {
        if(player.ids.length <= 1) {
            return 0;
        }

        let randomIdx = currentIdx;
        while(randomIdx === currentIdx) {
            randomIdx = Math.floor(Math.random() * player.ids.length);
        }
        nextSongId = player.ids[randomIdx]
    }
    
    playbackChannel.send({
        type: 'broadcast',
        event: 'set_player_config',
        payload: { activeId: nextSongId, originatedBy: 'all', playbackTime: 0 },
    }).then(resp => { console.log('Broacast: Next song id: ', nextSongId, ' - Response: ', resp) });
}