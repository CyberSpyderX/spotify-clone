import useLoadImage from "@/hooks/useLoadImage";
import { Song } from "@/types";
import Image from "next/image";
import { useEffect, useRef } from "react";
import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";
import { ConnectToADeviceIcon, deviceIcons } from "./PlayerIcons";
import { PlayerProps } from "./DesktopPlayer";
import usePlayer from "@/hooks/usePlayer";
import usePlaybackUsers from "@/hooks/usePlaybackUsers";
import { FaPause, FaPlay, FaRegPauseCircle } from "react-icons/fa";
import { getDeviceIcon, getDeviceTypeString } from "@/libs/utils";
import { PiPlusCircleLight } from "react-icons/pi";

const MobilePlayer: React.FC<PlayerProps> = ({
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
    // const Icon = player.playing ? FaPause: FaPlay;

    return (
        <div className="md:hidden cursor-pointer py-2 flex justify-between space-x-3"> 
            <div className="flex justify-start gap-x-4 truncate ">
                <MediaItem song={songData}/>
                <LikeButton songId={songData.id}/>
            </div>
            <div className="flex items-center gap-x-4">
                <ConnectToADeviceIcon
                    svgDim={{ height: 24, width: 24 }}
                    onClick={() => {setShowConnectDevices(prev => !prev)}}
                    type={
                        player.activeDeviceIds.length > 1 ? 'Multiple-big' :
                        player.activeDeviceIds[0] === player.deviceId ? 'Off-big' :
                        playbackUsers.users.find(user => user.id === player.activeDeviceIds[0])?.device_type_icon + '-big' ?? 'Web-big'
                    } >
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
                        right-0
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
                    <Icon size={24} onClick={handlePlayback} />
            </div>
        </div>
    );
}
 
export default MobilePlayer;