
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { Howl, Howler } from 'howler';
import { Song } from "@/types";

import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";
import Slider from "./Slider";
import usePlayer, { BroadcastPlayerStore } from "@/hooks/usePlayer";
import { useEffect, useMemo, useRef, useState } from "react";
import { SyncLoader } from "react-spinners";
import ProgressBar from "./ProgressBar";
import { twMerge } from "tailwind-merge";
import { ConnectToADeviceIcon, NextIcon, PlayingOnOtherDeviceIcon, PreviousIcon, RepeatIcon, ShuffleIcon, VolumeIcon } from "./PlayerIcons";
import { IoMdPause, IoMdPlay } from "react-icons/io";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { RealtimeChannel } from "@supabase/supabase-js";
import usePlaybackUsers from "@/hooks/usePlaybackUsers";
import { getBroadcastPlayer } from "@/libs/utils";



interface PlayerContentProps {
    key: string;
    songData: Song;
    songUrl: string;
    channel: RealtimeChannel | null;
}

const PlayerContent:React.FC<PlayerContentProps> = ({ key, songData, songUrl, channel }) => {
    const player = usePlayer();
    const playbackUsers = usePlaybackUsers();
    const [volume, setVolume] = useState(player.volume);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(player.playing);
    const [songElapsedTime, setSongElapsedTime] = useState(player.playbackTime);
    const song = useRef<Howl>();
    const volumeBuffer = useRef(0);
    const elapsedTimeInterval: any = useRef();
    const { supabaseClient, session } = useSessionContext();
    const playbackChannel = useRef(supabaseClient.channel(session?.user.email!));

    const Icon = player.playing ? IoMdPause : IoMdPlay;
    const activeUser = playbackUsers.users.find(user => user.id === player.activeDeviceId);

    useEffect(() => {
        console.log('Creating PlayerContent...', player.activeId, player.activeDeviceId, player.deviceId, player.isActiveUser);
        
        song.current = new Howl({
            src: songUrl,
            volume: volume,
            format: 'mp3',
            html5: true,
            onload: () => {
                console.log('Song Loaded...');
                setIsLoading(false);
                player.setPlaying(true);
            },
            onloaderror: () => {
                console.log('Loading error...');
            }, onplayerror: () => {
                console.log('Playing error...');
            }, onend: () => {
                if(player.deviceId === player.activeDeviceId) {
                    onPlayNext();
                }
            }
        });
        
        if(player.activeDeviceId === '' ||
            player.activeDeviceId === player.deviceId) {
            
            const newState = {
                activeId: player.activeId,
                ids: player.ids,
                playing: true,
                volume: player.volume,
                shuffle: player.shuffle,
                repeat: player.repeat,
                muted: player.muted,
                activeDeviceId: player.deviceId,
                playbackTime: song.current.seek(),
            };
            player.setNewState(newState);

            playbackChannel.current.send({
                type: 'broadcast',
                event: 'set_player_config',
                payload: {
                    originatedBy: player.deviceId,
                    ...newState,
                }
            });
        }

        return () => {
            player.setPlaying(false);
            song.current?.unload();
            console.log('Destroying PlayerContent...');
        }
    }, []);

    useEffect(() => {
        if(player.activeDeviceId !== player.deviceId) {
            song.current?.pause();
        } else {
            console.log(player.playbackTime);
            
            song.current?.play();
            song.current?.seek(songElapsedTime);
        }
    }, [player.activeDeviceId]);

    function recordElapsedTime() {
        if(elapsedTimeInterval.current === undefined) {
            elapsedTimeInterval.current = setInterval(() => {
                    if(player.deviceId === player.activeDeviceId) {
                        setSongElapsedTime(Number(song.current!.seek().toFixed(0)));
                    } else {
                        setSongElapsedTime(prev => prev + 1);
                    }
            }, 1000);
        }
    }
    function stopRecordElapsedTime() {
        clearInterval(elapsedTimeInterval.current);
        elapsedTimeInterval.current = undefined;
    }
    
    const onPlayNext = () => {
        if(player.ids.length === 0) {
            return;
        }
        
        const currentIdx = player.ids.findIndex((id) => id === player.activeId);
        const nextSong = player.ids[currentIdx + 1];

        const nextSongId = (!nextSong) ? player.ids[0] : nextSong;

        playbackChannel.current.send({
            type: 'broadcast',
            event: 'set_player_config',
            payload: { activeId: nextSongId, originatedBy: 'all'},
        });
    }
    
    const onPlayPrevious = () => {
        if(player.ids.length === 0) {
            return;
        }

        const currentIdx = player.ids.findIndex((id) => id === player.activeId);
        const previousSong = player.ids[currentIdx - 1];

        const previousSongId = (!previousSong) ? player.ids[0] : previousSong;
        
        playbackChannel.current.send({
            type: 'broadcast',
            event: 'set_player_config',
            payload: { activeId: previousSongId, originatedBy: 'all'},
        });
    }

    useEffect(() => {
        console.log('Playing changed: ', player.playing, player.activeDeviceId, player.deviceId, player.isActiveUser);
        
        setIsPlaying(player.playing);
        if(player.playing) {
            recordElapsedTime();
            if(player.deviceId === player.activeDeviceId) {
                song.current?.play();
            }
        } else {
            stopRecordElapsedTime();
            if(player.deviceId === player.activeDeviceId) {
                song.current?.pause();
            }
        }

    }, [player.playing]);

    useEffect(() => {
        setSongElapsedTime(player.playbackTime);
    }, [player.playbackTime]);

    useEffect(() => {
        setVolume(player.volume);
        song.current?.volume(player.volume);
    }, [player.volume]);

    useEffect(() => {
        console.log('Shuffle: ', player.shuffle);
    }, [player.shuffle]);

    useEffect(() => {
        console.log('Asking wala effect......', player.askForPlayer , player.deviceId , player.activeDeviceId);
        
        if(player.askForPlayer && player.deviceId === player.activeDeviceId) {
            console.log('Sending............. ', {...getBroadcastPlayer(player), playbackTime: songElapsedTime});
            
            playbackChannel.current.send({
                type: 'broadcast',
                event: 'set_player_config',
                payload: { originatedBy: player.deviceId, ...getBroadcastPlayer(player), playbackTime: songElapsedTime, askForPlayer: false}
            });
        }
        player.setAskForPlayer(false);
    }, [player.askForPlayer]);

    const handlePlayback = () => {
        playbackChannel.current.send({
            type: 'broadcast',
            event: 'set_player_config',
            payload: {
                playing: !isPlaying, 
                originatedBy: player.deviceId,
                activeDeviceId: player.activeDeviceId
            }
        });
        console.log('Pause/Play player sent: ', isPlaying);
        
        if(isPlaying) {
            player.setPlaying(false);
        } else {
            player.setPlaying(true);
        }
    }
    
    const handleVolumeChange = async (newVolume: number, commit?: boolean) => {
        
        setVolume(newVolume)

        if(newVolume) { volumeBuffer.current = newVolume; }

        if(commit) { 
            player.setVolume(newVolume);
            playbackChannel.current.send({
                type: 'broadcast',
                event: 'set_player_config',
                payload: { 
                    volume: newVolume, 
                    originatedBy: player.deviceId,
                    activeDeviceId: player.activeDeviceId
                }
            });
            console.log('Volume broadcast sent: ', newVolume);
            
        }
        
    }

    const handleProgressChange = async (val: number[], commit: boolean = false) => {
        stopRecordElapsedTime();

        setSongElapsedTime(Number(val[0].toFixed(0)));
        if(commit) {

            playbackChannel.current.send({
                type: 'broadcast',
                event: 'set_player_config',
                payload: {playbackTime: val[0], originatedBy: player.deviceId},
            });

            song.current?.seek(val[0]);
            recordElapsedTime();
        }
    }

    useEffect(() => {
        if(player.deviceId === player.activeDeviceId) {
            song.current?.seek(player.playbackTime);
        }
    }, [player.playbackTime]);

    const handleShuffle = async () => {
        playbackChannel.current.send({
            type: 'broadcast',
            event: 'set_player_config',
            payload: { shuffle: !player.shuffle, originatedBy: player.deviceId }
        });
        player.toggleShuffle();        
    }

    const handleRepeat = async () => {
        playbackChannel.current.send({
            type: 'broadcast',
            event: 'set_player_config',
            payload: { repeat: player.repeat === 'off' ? 'all' : (player.repeat === 'all' ? 'one' : 'off'), originatedBy: player.deviceId }
        });
        player.setRepeat();
    }

    const toggleMute = () => {
        if(volume===0) {
            handleVolumeChange(volumeBuffer.current, true);
        } else {
            handleVolumeChange(0, true);
        }
    }

    return (
        <div className="flex flex-col">
            <div className="grid grid-cols-2 md:grid-cols-3">
                <div className="
                    flex
                    w-full
                    justify-start
                    items-center
                ">
                    <div className="flex gap-x-4">
                        <MediaItem song={songData} />
                        <LikeButton songId={songData.id} />
                    </div>
                </div>
                <div className="
                    flex
                    md:hidden
                    items-center
                    justify-end
                    w-full
                    col-auto
                ">
                    {
                        isLoading
                        ? <SyncLoader color="#22c55e" />
                        : <div
                            onClick={handlePlayback} 
                            className="
                            flex
                            items-center
                            justify-center
                            h-8
                            w-8
                            cursor-pointer
                            text-black
                            bg-white
                            rounded-full
                            hover:scale-105
                            transition
                        ">
                            <Icon size={16} style={{ marginLeft: isPlaying ? 0 : '3px' }} />
                        </div>
                    }
                    
                </div>
                <div className="flex flex-col">
                    <div className="
                        hidden
                        md:flex
                        justify-center
                        items-center
                        pt-3
                        w-full
                        h-full
                        max-w-[722px]
                        gap-x-[8px]
                    ">
                        <ShuffleIcon state={player.shuffle} onClick={handleShuffle} /> 
                        <PreviousIcon onClick={onPlayPrevious}/>
                        <div
                            onClick={handlePlayback} 
                            className="
                            flex
                            items-center
                            justify-center
                            h-8
                            w-8
                            mx-2
                            cursor-pointer
                            text-black
                            bg-white
                            rounded-full
                            hover:scale-105
                        ">
                            <Icon size={20} style={{ marginLeft: isPlaying ? 0 : '3px' }} />
                        </div>
                        <NextIcon onClick={onPlayNext} />
                        <RepeatIcon state={player.repeat} onClick={handleRepeat} />

                    </div>
                    <div className="
                        flex
                        h-auto
                        gap-x-2
                    ">
                        <ProgressBar 
                            elapsedTime={songElapsedTime} 
                            duration={Math.trunc(song.current?.duration(0) || 0)} 
                            handleProgressChange={handleProgressChange}    
                        />
                    </div>
                    
                </div>
                <div className="hidden md:flex justify-end items-center pr-4">
                    <ConnectToADeviceIcon 
                        type={activeUser?.device_type_icon ?? ''} 
                        users={playbackUsers.users}
                        channel={playbackChannel.current}
                        player={player}
                        songElapsedTime={songElapsedTime}
                    />
                    <div className="flex items-center gap-x-2 w-[130px]">
                        <VolumeIcon volume={volume} onClick={toggleMute} />
                        <Slider
                            value={volume}
                            onChange={handleVolumeChange}
                        />
                    </div>
                </div>
            </div>
            {
                player.activeDeviceId !== player.deviceId && 
                <div className="bg-[#1ed760] h-6 py-2 pl-4 justify-end pr-[73.5px] flex gap-1 w-full items-center rounded-md">
                    <PlayingOnOtherDeviceIcon />
                    <p className="text-black font-semibold text-[15px]">
                        Playing on {activeUser?.device_type}
                    </p>
                </div>
            }
        </div>
    );
}

export default PlayerContent;