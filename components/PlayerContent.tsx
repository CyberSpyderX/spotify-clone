
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
    const [showConnectDevices, setShowConnectDevices] = useState(true);
    const [isPlaying, setIsPlaying] = useState(player.playing);
    const [songElapsedTime, setSongElapsedTime] = useState(player.playbackTime);
    const song = useRef<Howl>();
    const volumeBuffer = useRef(0);
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
            format: 'mp3',
            html5: true,
            onload: () => {
                console.log('Song loaded!');
                setIsLoading(false);
                if(isActiveDevice || player.playing) {
                    player.setPlaying(true);
                }
            },
            onloaderror: () => {
                console.log('Loading error...');
            }, onplayerror: () => {
                console.log('Playing error...');
            }, onend: () => {
                if(isActiveDevice) {
                    onPlayNext();
                }
            }
        });
        
        return () => {
            player.setPlaying(false);
            song.current?.unload();
            console.log('Destroying PlayerContent...');
        }
    }, []);

    useEffect(() => {
        console.log('Setting songElapsedTime to: ', player.playbackTime);
        setSongElapsedTime(player.playbackTime);
    }, [player.playbackTime]);

    useEffect(() => {
        console.log("UseEffect: activeDeviceIds ", player.playbackTime, isActiveDevice);

        stopRecordElapsedTime();
        if(!isActiveDevice) {
            console.log("isLoading: ", isLoading);
            
            if(!isLoading) {
                console.log('Not any longer the active device... Pausing!');
                song.current?.pause();
            }
        } else {
            if(!isLoading && player.playing) {
                console.log('Now the active device... Playing! , ', songElapsedTime);
                song.current?.seek(player.playbackTime);
                song.current?.play();
            }
        }
        if(player.playing) {
            recordElapsedTime();
        }
    }, [player.activeDeviceIds]);

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

    useEffect(() => {
        console.log('Playing changed: ', player.playing, (isActiveDevice));
        
        setIsPlaying(player.playing);
        if(player.playing) {
            recordElapsedTime();
            if(isActiveDevice && !isLoading) {
                song.current?.play();
            }
        } else {
            stopRecordElapsedTime();
            if(isActiveDevice && !isLoading) {
                song.current?.pause();
            }
        }

    }, [player.playing]);


    useEffect(() => {
        setVolume(player.volume);
        song.current?.volume(player.volume);
    }, [player.volume]);

    useEffect(() => {
        console.log('Shuffle: ', player.shuffle);
    }, [player.shuffle]);

    useEffect(() => {
        console.log('Asking wala effect......', player.askForPlayer , (isActiveDevice));
        
        if(player.askForPlayer && isActiveDevice) {
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
                playing: !player.playing, 
                originatedBy: player.deviceId,
            }
        });
        console.log('Pause/Play player sent: ', player.playing);
        
        if(player.playing) {
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
        if(isActiveDevice) {
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
                            <Icon size={16} style={{ marginLeft: player.playing ? 0 : '3px' }} />
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
                        {
                            isLoading ? 
                            <SyncLoader color="#22c55e" /> : 
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
                                <Icon size={20} style={{ marginLeft: player.playing ? 0 : '3px' }} />
                            </div>
                        }
                        
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
                        onClick={() => {setShowConnectDevices(prev => !prev)}}
                        type={
                            player.activeDeviceIds.length > 1 ? 'Multiple' :
                            player.activeDeviceIds[0] === player.deviceId ? 'Off' :
                            playbackUsers.users.find(user => user.id === player.activeDeviceIds[0])
                        }
                    >
                    {
                        showConnectDevices ? 
                        <div
                        
                        onClick={(event)=> {
                            event?.stopPropagation()
                        }}
                        className="
                        w-[320px]
                        cursor-auto
                        p-3
                        bg-black
                        absolute
                        bottom-[122px]
                        rounded-lg
                        bg-neutral-900/90
                        backdrop-blur-sm
                        "
                    >
                        <div
                        className="
                            connectToDevicesDiv
                            p-4
                            bg-neutral-700
                            backdrop-blur-sm
                            font-bold
                            text-xl
                            rounded-md
                            flex
                            flex-col
                        ">
                            <div className="flex 
                                w-fit 
                                h-[20px]
                                gap-x-2
                                items-center
                            ">
                                {
                                    player.playing ? 
                                        <Image 
                                        alt="Playing"
                                        src={'https://open.spotifycdn.com/cdn/images/device-picker-equaliser-animation.946e7243.webp'} 
                                        width={20}
                                        height={20}
                                    /> : <FaRegPauseCircle size={20} color="#fc3a3a"/>
                                }
                            Current device
                            </div>
                            <div className="border-1 border-white bg-gray-700 rounded-md my-4 py-[1px]" />

                            <div className="flex gap-x-2">
                                {
                                    player.activeDeviceIds.map((id, idx) => (
                                        <div 
                                          key={idx} 
                                          className="w-8 h-8 flex justify-center items-center rounded-full border-neutral-600 border-2"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
                                            
                                            playbackChannel.current.send({
                                                type: 'broadcast',
                                                event: 'set_player_config',
                                                payload: { activeDeviceIds: [ ...player.activeDeviceIds.filter(deviceId => deviceId !== id) ], originatedBy: 'all', playbackTime: songElapsedTime},
                                            })
                                          }}
                                        >
                                            <div className="w-6 h-6 rounded-full text-black flex items-center justify-center">
                                                <svg height={16} width={16} className="text-black">
                                                    {
                                                        deviceIcons[getDeviceIcon(id, playbackUsers.users)].map((d, index) => <path key={index} d={d}></path>)
                                                    }
                                                </svg>
                                            </div>
                                        </div>
                                    ))
                                }
                                
                            </div>
                        </div>
                        <div className="w-full p-2 flex flex-col rounded-md text-neutral-400 gap-y-2">
                            Other Devices
                            {
                                playbackUsers.users.map((user, idx) => {
                                    if(player.activeDeviceIds.includes(user.id)) {
                                        return
                                    }
                                    return (
                                        <div key={idx}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                playbackChannel.current.send({
                                                    type: 'broadcast',
                                                    event: 'set_player_config',
                                                    payload: { activeDeviceIds: [user.id], originatedBy: 'all', playbackTime: songElapsedTime},
                                                })
                                            }}
                                            className="
                                                text-white 
                                                flex
                                                group
                                                justify-between
                                                items-center
                                                rounded-md 
                                                cursor-pointer 
                                                hover:bg-neutral-700 
                                                p-3
                                                fill-neutral-200"
                                            >
                                                <div className="flex gap-x-3">
                                            <svg height={24} width={24} viewBox="0 0 24 24" className="">
                                                {
                                                    deviceIcons[getDeviceIcon(user.id, playbackUsers.users) + '-big'].map((d, i) => <path d={d} key={i} width={32} height={32}></path>)
                                                }
                                            </svg>
                                            {
                                                (user.id === player.deviceId) ? "This Device" : getDeviceTypeString(user.id, playbackUsers.users)
                                            }
                                            </div>
                                            <PiPlusCircleLight 
                                                size={24} 
                                                color="green" 
                                                className="hidden group-hover:block hover:scale-110"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    playbackChannel.current.send({
                                                        type: 'broadcast',
                                                        event: 'set_player_config',
                                                        payload: { activeDeviceIds: [ ...player.activeDeviceIds, user.id ], originatedBy: 'all', playbackTime: songElapsedTime},
                                                    })
                                                }}
                                            />
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div> : null
                    }
                    </ConnectToADeviceIcon>
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
                !isActiveDevice && 
                <div className="bg-[#1ed760] h-6 py-2 pl-4 justify-end pr-[73.5px] flex gap-1 w-full items-center rounded-md">
                    <PlayingOnOtherDeviceIcon />
                    <p className="text-black font-semibold text-[15px]">
                        Playing on {
                            player.activeDeviceIds.length > 1 ? 'multiple devices' : getDeviceTypeString(player.activeDeviceIds[0], playbackUsers.users)
                        }
                    </p>
                </div>
            }
        </div>
    );
}

export default PlayerContent;

/*


*/