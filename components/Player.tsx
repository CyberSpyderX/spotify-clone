"use client"

import useGetSongById from "@/hooks/useGetSongById";
import useLoadSongUrl from "@/hooks/useLoadSongUrl";
import usePlayer, { BroadcastPlayerStore } from "@/hooks/usePlayer";
import PlayerContent from "./PlayerContent";
import { useEffect, useRef } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useSessionContext } from "@supabase/auth-helpers-react";
import uniqid from "uniqid";
import { getBroadcastPlayer, getDeviceType } from "@/libs/utils";
import usePlaybackUsers, { PlaybackUser } from "@/hooks/usePlaybackUsers";

const Player = () => {
    const player = usePlayer();
    const playbackUsers = usePlaybackUsers();
    const { song } = useGetSongById(player.activeId);
    const songUrl = useLoadSongUrl(song!);
    const { supabaseClient, session } = useSessionContext();
    const channelRef = useRef<RealtimeChannel | null>(null);
    function sendPlayerToNewUser() {
        console.log('sendPlayerToNewUser.... player: ', player);
    }

    useEffect(() => {
        let subscription: RealtimeChannel, channel: RealtimeChannel, my_curr_user: PlaybackUser;
        if(session?.user.email) {
            channel = supabaseClient.channel(session.user.email!);
            
            subscription = channel.subscribe((status, error) => {
                if(status !== 'SUBSCRIBED') { return null }
                
                console.log('Connected to channel!');
                const id = uniqid();
                player.setDeviceId(id);
                
                // const device_type = getDeviceType(navigator.userAgent, navigator?.platform, !!(navigator?.brave));
                const myUser = { id, device_type: 'iPad', device_type_icon: 'iPad' };
                my_curr_user = myUser;
                playbackUsers.setMyUser(myUser);
                playbackUsers.addUser(myUser);
                console.log('My user:', myUser);
                
                channel.send({
                    type: 'broadcast',
                    event: 'new_user',
                    payload: { user: myUser },
                }).then((response) => {console.log('new_user message: ' +  JSON.stringify(response) + ' - ' +  player.activeDeviceIds)});

                channel.on("broadcast", { event: 'new_user'},
                (data) => { 
                    console.log("New user logged in....", data.payload.user);
                    playbackUsers.addUser(data.payload.user);
                    player.setAskForPlayer(true);
                    channel.send({
                        type: 'broadcast',
                        event: 'existing_user',
                        payload: { user: myUser }
                    });
                });
                console.log('New user handler attached');
                
                channel.on("broadcast", { event: 'existing_user' },
                    (data) => { 
                        console.log('Existing user message from... ', data.payload.user);
                        
                        playbackUsers.addUser(data.payload.user);
                    });
                console.log('Existing user handler attached');

                channel.on("broadcast", { event: 'leaving_user' },
                    (data) => { 
                        console.log('Leaving user message from... ', data.payload);
                        playbackUsers.removeUser(data.payload.id);
                    });

                channel.on("broadcast", { event: 'set_player_config' },
                    (data) => {
                        if(data.payload.originatedBy !== myUser.id) {
                            console.log('Receving player config... ', data.payload);
                            player.setNewState(data.payload);
                        }
                    });
            });
            channelRef.current = channel;
        }

        return () => {

            if(subscription && channel) {
                channel.send({
                    type: 'broadcast',
                    event: 'leaving_user',
                    payload: {id: my_curr_user.id}
                })
                subscription?.unsubscribe();
            }
            playbackUsers.reset();
            player.reset();
            
        }
    }, [session?.user.email]);

    useEffect(() => {
        if(player.activeId) {
            console.log('Player changed...', { deviceId: player.deviceId ,...getBroadcastPlayer(player)});
        }
    }, [player]);

    if(!song || !songUrl || !player.activeId) return null;

    return (
        <div className="
            fixed
            bottom-0
            bg-black
            w-full
            px-4
            pb-2
        ">
            <PlayerContent 
                key={songUrl}
                songData={song}
                songUrl={songUrl}
                channel={channelRef.current}
            />
        </div>
    );
}
 
export default Player;