import { Song } from "@/types";
import LikeButton from "./LikeButton";
import MediaItem from "./MediaItem";
import { SyncLoader } from "react-spinners";
import usePlayer from "@/hooks/usePlayer";
import { IconType } from "react-icons";
import { ConnectToADeviceIcon, NextIcon, PlayingOnOtherDeviceIcon, PreviousIcon, RepeatIcon, ShuffleIcon, VolumeIcon, deviceIcons } from "./PlayerIcons";
import ProgressBar from "./ProgressBar";
import usePlaybackUsers from "@/hooks/usePlaybackUsers";
import Image from "next/image";
import { FaRegPauseCircle } from "react-icons/fa";
import { RealtimeChannel } from "@supabase/supabase-js";
import { getDeviceIcon, getDeviceTypeString } from "@/libs/utils";
import { PiPlusCircleLight } from "react-icons/pi";
import Slider from "./Slider";

export interface PlayerProps {
    song: Howl;
    volume: number;
    isLoading: boolean;
    songData: Song;
    songElapsedTime: number;
    showConnectDevices: boolean;
    isActiveDevice: boolean;
    playbackChannel: RealtimeChannel;
    Icon: IconType;
    onPlayPrevious: () => void;
    onPlayNext: () => void;
    handlePlayback: () => void;
    handleShuffle:  () => void;
    handleRepeat: () => void;
    toggleMute: () => void;
    handleProgressChange: (val: number[], commit?: boolean) => Promise<void>;
    handleVolumeChange: (newVolume: number, commit?: boolean) => Promise<void>;
    setShowConnectDevices: any
}

const DesktopPlayer: React.FC<PlayerProps> = ({ 
    song,
    isLoading,
    volume,
    songData,
    songElapsedTime,
    showConnectDevices,
    playbackChannel,
    isActiveDevice,
    Icon,
    onPlayPrevious,
    onPlayNext,
    handlePlayback,
    handleShuffle,
    handleRepeat,
    toggleMute,
    handleProgressChange,
    handleVolumeChange,
    setShowConnectDevices,
}) => {
    const player = usePlayer();
    const playbackUsers = usePlaybackUsers();
    return (
        <div className="hidden md:flex flex-col">
            <div className="grid grid-cols-2 md:grid-cols-3">
                <div className="
                    flex
                    w-full
                    justify-start
                    items-center
                ">
                    <div className="flex gap-x-4 truncate">
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
                            duration={Math.trunc(song.duration(0) || 0)} 
                            handleProgressChange={handleProgressChange}    
                        />
                    </div>
                    
                </div>
                <div className=" md:flex justify-end items-center pr-4">
                    <ConnectToADeviceIcon
                        onClick={() => {setShowConnectDevices(prev => !prev)}}
                        type={
                            player.activeDeviceIds.length > 1 ? 'Multiple' :
                            player.activeDeviceIds[0] === player.deviceId ? 'Off' :
                            playbackUsers.users.find(user => user.id === player.activeDeviceIds[0])?.device_type_icon ?? 'Web'
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
                                          className="w-8 h-8 flex justify-center items-center rounded-full border-neutral-600 border-2 fill-[#1db954]"
                                          onClick={(event) => {
                                            if(player.activeDeviceIds.length === 1) { return }
                                            event.stopPropagation();
                                            playbackChannel.send({
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
                                                playbackChannel.send({
                                                    type: 'broadcast',
                                                    event: 'set_player_config',
                                                    payload: { activeDeviceIds: [user.id], originatedBy: 'all', playbackTime: songElapsedTime, playing: true },
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
                                                    playbackChannel.send({
                                                        type: 'broadcast',
                                                        event: 'set_player_config',
                                                        payload: { activeDeviceIds: [ ...player.activeDeviceIds, user.id ], originatedBy: 'all', playbackTime: songElapsedTime, playing: true},
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
 
export default DesktopPlayer;