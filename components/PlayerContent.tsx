
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { Howl, Howler } from 'howler';
import { Song } from "@/types";

import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";
import Slider from "./Slider";
import usePlayer from "@/hooks/usePlayer";
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



interface PlayerContentProps {
    key: string;
    songData: Song;
    songUrl: string;
}

const PlayerContent:React.FC<PlayerContentProps> = ({ key, songData, songUrl }) => {
    const player = usePlayer();
    const playbackUsers = usePlaybackUsers();
    const [volume, setVolume] = useState(player.volume);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(player.playing);
    const [songElapsedTime, setSongElapsedTime] = useState(0);
    const song = useRef<Howl | null>(null);
    const volumeBuffer = useRef(0);
    const elapsedTimeInterval: any = useRef();
    const { supabaseClient, session } = useSessionContext();
    const playbackChannel = useRef(supabaseClient.channel(session?.user.email!));

    function recordElapsedTime() {
        elapsedTimeInterval.current = setInterval(() => {
            if(song.current) {
                setSongElapsedTime(Number(song.current.seek().toFixed(0)));
            }
        }, 1000);
    }
    function stopRecordElapsedTime() {
        clearInterval(elapsedTimeInterval.current);
    }
    const Icon = isPlaying ? IoMdPause : IoMdPlay;
    // const VolumeIcon = volume === 0 || player.muted ? HiSpeakerXMark : HiSpeakerWave;
    
    const onPlayNext = () => {
        if(player.ids.length === 0) {
            return;
        }
        
        const currentIdx = player.ids.findIndex((id) => id === player.activeId);
        const nextSong = player.ids[currentIdx + 1];

        if(!nextSong) {
            return player.setActiveId(player.ids[0]);
        }

        player.setActiveId(nextSong);
    }
    
    const onPlayPrevious = () => {
        if(player.ids.length === 0) {
            return;
        }

        const currentIdx = player.ids.findIndex((id) => id === player.activeId);
        const previousSong = player.ids[currentIdx - 1];

        if(!previousSong) {
            return player.setActiveId(player.ids[player.ids.length - 1]);
        }

        player.setActiveId(previousSong);
    }

    useEffect(() => {
        setIsPlaying(player.playing);
    }, [player.playing]);

    useEffect(() => {
        song.current = new Howl({
            src: songUrl,
            volume: volume,
            format: 'mp3',
            html5: true,
            onload: () => {
                setIsLoading(false);
                setIsPlaying(true);
                recordElapsedTime();
                song.current?.play();
            },
        });
        
        if(player.activePlaybackDeviceId === '' ||
             player.activePlaybackDeviceId === playbackUsers.myUser?.id) {
            
            playbackChannel.current.send({
                type: 'broadcast',
                event: 'set_player_config',
                payload: {
                    activeId: player.activeId,
                    ids: player.ids,
                    playing: player.playing,
                    volume: player.volume,
                    shuffle: player.shuffle,
                    repeat: player.repeat,
                    muted: player.muted,
                    isActiveUser: player.isActiveUser,
                    activePlaybackDeviceId: player.activePlaybackDeviceId,
                }
            });
        }

        return () => {
            song.current?.unload();
        }
    }, []);



    const handlePlayback = async (val?: boolean) => {
        
        if(isPlaying) {
            setIsPlaying(false);
            player.setPlaying(false);
            // player.setPlaying(false);
            song.current?.pause();
        } else {
            setIsPlaying(true);
            player.setPlaying(true);
            song.current?.play();
        }

        playbackChannel.current.send({
            type: 'broadcast',
            event: 'set_player_config',
            payload: { playing: !isPlaying }
        })
        
    }
    
    const handleVolumeChange = async (newVolume: number, commit?: boolean) => {
        
        setVolume(newVolume)
        song.current?.volume(newVolume);

        if(newVolume) { volumeBuffer.current = newVolume; }

        if(commit) { player.setVolume(volume) }
        
    }

    const handleProgressChange = async (val: number[], commit: boolean = false) => {
        stopRecordElapsedTime();

        setSongElapsedTime(Number(val[0].toFixed(0)));
        if(commit) {
            song.current?.seek(val[0]);
            recordElapsedTime();
        }

    }

    const handleShuffle = async () => {
        player.toggleShuffle();
        
    }

    const handleRepeat = async () => {
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
                    <ConnectToADeviceIcon onClick={() => {}} type={playbackUsers.myUser?.device_type_icon} users={playbackUsers.users} />
                    <div className="flex items-center gap-x-2 w-[130px]">
                        <VolumeIcon volume={volume} onClick={toggleMute} />
                        <Slider
                            value={volume}
                            onChange={handleVolumeChange}
                        />
                    </div>
                </div>
            </div>
            <div className="bg-[#1ed760] h-6 py-2 pl-4 justify-end pr-[73.5px] flex gap-1 w-full items-center rounded-md">
                <PlayingOnOtherDeviceIcon />
                <p className="text-black font-semibold text-[15px]">
                    Playing on {playbackUsers.myUser?.device_type}
                </p>
            </div>
        </div>
    );
}

export default PlayerContent;