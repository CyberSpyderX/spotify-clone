
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
import { ConnectToADeviceIcon, NextIcon, PlayingOnOtherDeviceIcon, PreviousIcon, RepeatIcon, ShuffleIcon, VolumeIcon, deviceIcons } from "./PlayerIcons";
import { IoMdPause, IoMdPlay } from "react-icons/io";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { RealtimeChannel } from "@supabase/supabase-js";
import usePlaybackUsers from "@/hooks/usePlaybackUsers";
import { getBroadcastPlayer, getDeviceIcon, getDeviceTypeString } from "@/libs/utils";
import Image from "next/image";
import { FaRegPauseCircle } from "react-icons/fa";
import { PiPlusCircleLight } from "react-icons/pi";
import { onPlayNext } from "@/libs/playerFunctions";
import DesktopPlayer from "./DesktopPlayer";
import MobilePlayer from "./MobilePlayer";

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
    const [showConnectDevices, setShowConnectDevices] = useState(false);
    const [isPlaying, setIsPlaying] = useState(player.playing);
    const [isMobilePlayerShowing, setIsMobilePlayerShowing] = useState(false);
    const [songElapsedTime, setSongElapsedTime] = useState(player.playbackTime);
    const song = useRef<Howl>();
    const volumeBuffer = useRef(player.volume);
    const elapsedTimeInterval: any = useRef();
    const { supabaseClient, session } = useSessionContext();
    const playbackChannel = useRef(supabaseClient.channel(session?.user.email!));

    const Icon = player.playing ? IoMdPause : IoMdPlay;
    const isActiveDevice = player.activeDeviceIds.includes(player.deviceId);
    
    useEffect(() => {
        console.log('Creating PlayerContent...', isActiveDevice);
        song.current = new Howl({
            src: songUrl,
            volume: volume,
            autoplay: true,
            format: 'mp3',
            html5: true,
            onload: () => {
                console.log('Song loaded!');
                setIsLoading(false);
            },
            onloaderror: () => {
                console.log('Loading error...');
            }, onplayerror: (id, error) => {
                console.log('Song Error occured...', error);
            }, onend: () => {
                if(isActiveDevice) {
                    onPlayNext();
                }
                // TODO: Revert
            }
        });
        console.log('Creating PlayerContent...', isActiveDevice);
        return () => {
            // player.setPlaying(false);
            song.current?.unload();
            console.log('Destroying PlayerContent...');
        }
    }, []);

    useEffect(() => {
        console.log('Setting songElapsedTime to: ', player.playbackTime);
        setSongElapsedTime(player.playbackTime);
    }, [player.playbackTime]);

    useEffect(() => {
        console.log("UseEffect: activeDeviceIds ", player.playbackTime, isActiveDevice, isLoading, player.playing, song.current.playing());
        stopRecordElapsedTime();
        if(!isActiveDevice) {
            console.log("isLoading: ", isLoading);
            
            if(!isLoading) {
                console.log('Not any longer the active device... Pausing!');
                song.current?.pause();
            }
        } else {
            if(!isLoading && player.playing && !song.current.playing()) {
                console.log('Now the active device... Playing! , ', songElapsedTime, player.playbackTime);
                song.current?.seek(player.playbackTime);
                song.current?.play();
            }
        }
        if(player.playing) {
            recordElapsedTime();
        }
    }, [player.activeDeviceIds, isLoading]);

    useEffect(() => {
        console.log('Playing changed: ', player.playing, isActiveDevice, song.current.playing());
        
        if(player.playing) {
            recordElapsedTime();
            if(isActiveDevice && !isLoading && !song.current.playing()) {
                console.log('Song playing... loading state: ', song.current.state());
                song.current?.play();
            }
        } else {
            stopRecordElapsedTime();
            if(isActiveDevice && !isLoading && song.current.playing()) {
                console.log('Song paused... loading state: ', song.current.state());
                song.current?.pause();
            }
        }
    }, [player.playing, isLoading]);


    useEffect(() => {
        setVolume(player.volume);
        song.current?.volume(player.volume);
    }, [player.volume]);

    useEffect(() => {
        if(player.askForPlayer && isActiveDevice) {
            playbackChannel.current.send({
                type: 'broadcast',
                event: 'set_player_config',
                payload: { originatedBy: player.deviceId, ...getBroadcastPlayer(player), playbackTime: songElapsedTime, askForPlayer: false}
            });
        }
        player.setAskForPlayer(false);
    }, [player.askForPlayer]);
    
    useEffect(() => {
        console.log('Playback time changed to: ', player.playbackTime);
        
        if(isActiveDevice) {
            song.current?.seek(player.playbackTime);
        }
    }, [player.playbackTime]);

    
    function recordElapsedTime() {
        if(elapsedTimeInterval.current === undefined) {
            console.log('In recordElapsedTime... Starting up!!!');
            
            elapsedTimeInterval.current = setInterval(() => {
                    if(isActiveDevice) {
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
        
        playbackChannel.current.send({
            type: 'broadcast',
            event: 'set_player_config',
            payload: { activeId: nextSongId, originatedBy: 'all', playbackTime: 0 },
        }).then(resp => { console.log('Broacast: Next song id: ', nextSongId, ' - Response: ', resp) });
    }
    
    const onPlayPrevious = () => {
        if(player.ids.length === 0) {
            return;
        }

        const currentIdx = player.ids.findIndex((id) => id === player.activeId);
        const previousSong = player.ids[currentIdx - 1];

        let  previousSongId = (!previousSong) ? player.ids[0] : previousSong;

        if(player.shuffle) {
            if(player.ids.length <= 1) {
                return 0;
            }

            let randomIdx = currentIdx;
            while(randomIdx === currentIdx) {
                randomIdx = Math.floor(Math.random() * player.ids.length);
            }
            previousSongId = player.ids[randomIdx]
        }
        playbackChannel.current.send({
            type: 'broadcast',
            event: 'set_player_config',
            payload: { activeId: previousSongId, originatedBy: 'all', playbackTime: 0},
        }).then(resp => { console.log('Broacast: Previous song id: ', previousSongId, ' - Response: ', resp) });
    }

    const handlePlayback = () => {
        player.setPlaying(!player.playing);
        playbackChannel.current.send({
            type: 'broadcast',
            event: 'set_player_config',
            payload: { playing: !player.playing, originatedBy: player.deviceId }
        });
        console.log('Pause/Play player sent: ', !player.playing);
    }
    
    const handleVolumeChange = async (newVolume: number, commit?: boolean) => {
        
        setVolume(newVolume)
        if(newVolume) { volumeBuffer.current = newVolume }
        if(commit) { 
            player.setVolume(newVolume);
            playbackChannel.current.send({
                type: 'broadcast',
                event: 'set_player_config',
                payload: { 
                    volume: newVolume, 
                    originatedBy: player.deviceId,
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
        console.log('ToggleMute volume: ', volume, volumeBuffer.current);
        
        if(volume===0) {
            handleVolumeChange(volumeBuffer.current, true);
        } else {
            handleVolumeChange(0, true);
        }
    }

    return (
        <>
            {
                song.current ?
                <div> 
                    <DesktopPlayer 
                    isLoading={isLoading} 
                    songData={songData} 
                    handlePlayback={handlePlayback}
                    handleShuffle={handleShuffle}
                    Icon={Icon}
                    volume={volume}
                    song={song.current}
                    songElapsedTime={songElapsedTime}
                    showConnectDevices={showConnectDevices}
                    isActiveDevice={isActiveDevice}
                    playbackChannel={playbackChannel.current}
                    onPlayNext={onPlayNext}
                    onPlayPrevious={onPlayPrevious}
                    handleProgressChange={handleProgressChange}
                    handleRepeat={handleRepeat}
                    handleVolumeChange={handleVolumeChange}
                    setShowConnectDevices={setShowConnectDevices}
                    toggleMute={toggleMute} />

                    <MobilePlayer isLoading={isLoading} 
                        songData={songData} 
                        handlePlayback={handlePlayback}
                        handleShuffle={handleShuffle}
                        Icon={Icon}
                        volume={volume}
                        song={song.current}
                        songElapsedTime={songElapsedTime}
                        showConnectDevices={showConnectDevices}
                        isActiveDevice={isActiveDevice}
                        playbackChannel={playbackChannel.current}
                        onPlayNext={onPlayNext}
                        onPlayPrevious={onPlayPrevious}
                        handleProgressChange={handleProgressChange}
                        handleRepeat={handleRepeat}
                        handleVolumeChange={handleVolumeChange}
                        setShowConnectDevices={setShowConnectDevices}
                        toggleMute={toggleMute} />
                </div>
                : null
            }        
        </>
    );
}

export default PlayerContent;