"use client"

import useGetSongById from "@/hooks/useGetSongById";
import useLoadSongUrl from "@/hooks/useLoadSongUrl";
import usePlayer from "@/hooks/usePlayer";
import PlayerContent from "./PlayerContent";
import { useEffect, useRef } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useSessionContext } from "@supabase/auth-helpers-react";
import uniqid from "uniqid";
import { getDeviceType } from "@/libs/utils";
import usePlaybackUsers, { PlaybackUser } from "@/hooks/usePlaybackUsers";

const Player = () => {
    const player = usePlayer();
    const playbackUsers = usePlaybackUsers();
    const { song } = useGetSongById(player.activeId);
    const songUrl = useLoadSongUrl(song!);
    const { supabaseClient, session } = useSessionContext();

    useEffect(() => {
        let subscription: RealtimeChannel, channel: RealtimeChannel, my_curr_user: PlaybackUser;
        if(session?.user.email) {
            channel = supabaseClient.channel(session.user.email!);
            
            subscription = channel.subscribe((status, error) => {
                if(status !== 'SUBSCRIBED') { return null }
                
                console.log('Connected to channel!');
                const id = uniqid();
                
                const device_type = getDeviceType(navigator.userAgent, navigator.platform, !!(navigator?.brave));
                const myUser = { id, ...device_type };
                my_curr_user = myUser;
                playbackUsers.setMyUser(myUser);

                console.log('My user:', myUser);
                
                channel.send({
                    type: 'broadcast',
                    event: 'new_user',
                    payload: { user: myUser },
                }).then((response) => {console.log('new_user message: ', response)});

                channel.on("broadcast", { event: 'new_user'},
                (data) => { 
                    console.log("New user logged in....", data.payload.user);
                    playbackUsers.addUser(data.payload.user)
                    channel.send({
                        type: 'broadcast',
                        event: 'existing_user',
                        payload: { user: myUser }
                    }) 
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
                        console.log('Receving player config... ', data.payload);
                        player.setNewState(data.payload);
                    });
            })
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
            
        }
    }, [session?.user.email]);

    useEffect(() => {
        if(player.activeId) {
            console.log('Player changed...', player);
            
        }
        
    }, [player]);

    if(!song || !songUrl || !player.activeId) return null;

    return (
        <div className="
            fixed
            bottom-0
            bg-black
            w-full
            h-[112px]
            px-4
            pb-2
        ">
            <PlayerContent 
                key={songUrl}
                songData={song}
                songUrl={songUrl}
            />
        </div>
    );
}
 
export default Player;