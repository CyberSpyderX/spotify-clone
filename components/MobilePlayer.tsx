import useLoadImage from "@/hooks/useLoadImage";
import { Song } from "@/types";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";
import { ConnectToADeviceIcon, NextIcon, PreviousIcon, RepeatIcon, ShuffleIcon, deviceIcons } from "./PlayerIcons";
import { PlayerProps } from "./DesktopPlayer";
import usePlayer from "@/hooks/usePlayer";
import usePlaybackUsers from "@/hooks/usePlaybackUsers";
import { FaChevronDown, FaPause, FaPlay, FaRegPauseCircle } from "react-icons/fa";
import { getDeviceIcon, getDeviceTypeString } from "@/libs/utils";
import { PiPlusCircleLight } from "react-icons/pi";
import ProgressBar from "./ProgressBar";
import { SyncLoader } from "react-spinners";

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
    const playerScreenRef = useRef(null);
    const imageUrl = useLoadImage(songData);
    const [showPlayerScreen, setShowPlayerScreen] = useState(true);

    useEffect(() => {
        if(showPlayerScreen) {
            playerScreenRef.current.style.transform = 'translateY(0)';
        } else {
            playerScreenRef.current.style.transform = 'translateY(100%)';
        }
    }, [showPlayerScreen]);

    return (
        <div className="md:hidden cursor-pointer py-2 flex justify-between gap-x-3 relative"
            onClick={() => { setShowPlayerScreen(true) }}
        >
            <div
                ref={playerScreenRef} 
                className="
                    h-full 
                    w-full 
                    items-center
                    flex 
                    flex-col 
                    cursor-default 
                    fixed 
                    bottom-0 
                    left-0 
                    right-0 
                    transition 
                    rounded-md 
                    duration-300 
                    z-10 
                    px-4
                    bg-black"
            >
                <div className="flex flex-col w-full max-w-[400px] h-full items-center">
                    <div className="py-3 justify-between flex w-full">
                        <div
                            onClick={(e) => { 
                                e.stopPropagation();
                                setShowPlayerScreen(false);
                            }} 
                            className="p-2 cursor-pointer"
                        >
                            <FaChevronDown size={24} />
                        </div>
                        <div className="flex items-center w-auto text-sm">
                            {songData.title}
                        </div>
                        <div className="w-[40px]  box-content "></div>
                    </div>
                    <div className=" w-[90%] max-w-[300px] aspect-square relative mb-10">
                        <div className="p-5 rounded-md overflow-hidden">
                            <Image src={imageUrl} alt="Cover" fill className="object-cover z-0 rounded-lg" />
                        </div>
                    </div>
                    <div className="flex mb-5 w-full justify-between px-4">
                        <div className="flex flex-col">
                            <p className="text-xl font-bold truncate">
                                { songData.title } 
                            </p>
                            <p className="text-sm text-neutral-300">
                                { songData.artists }
                            </p>
                        </div>
                        <LikeButton songId={songData.id} size={28} />
                    </div>
                    <ProgressBar 
                            elapsedTime={songElapsedTime} 
                            duration={Math.trunc(song.duration(0) || 0)} 
                            handleProgressChange={handleProgressChange}    
                    />
                    <div className="px-4 justify-between py-2 flex w-full items-center">
                        <ShuffleIcon
                            iconType={'big'}
                            svgDim={{height: 24, width: 24}} 
                            style={' fill-white'} 
                            state={player.shuffle} 
                            onClick={handleShuffle} 
                        />
                        
                        <PreviousIcon 
                            iconType={'big'}
                            style={' fill-white'} 
                            svgDim={{height: 24, width: 24}} 
                            onClick={onPlayPrevious}
                        />
                        {
                            isLoading ? 
                            <SyncLoader color="#22c55e" /> : 
                            <div
                                onClick={handlePlayback} 
                                className="
                                flex
                                items-center
                                justify-center
                                h-12
                                w-12
                                cursor-pointer
                                text-black
                                bg-white
                                rounded-full
                                hover:scale-105
                            ">
                                <Icon size={24} style={{ marginLeft: player.playing ? 0 : '3px' }} />
                            </div>
                        }
                        
                        <NextIcon
                            iconType={'big'}
                            style={' fill-white'} 
                            svgDim={{height: 24, width: 24}}  
                            onClick={onPlayNext} />
                        <RepeatIcon 
                            iconType={'big'}
                            style={' fill-white'} 
                            svgDim={{height: 24, width: 24}}  
                            state={player.repeat}
                            onClick={handleRepeat} />
                    </div>
                </div>
            </div> 
            <div className="flex justify-start gap-x-4 truncate ">
                <MediaItem song={songData} inactive={true} />
                <LikeButton songId={songData.id} />
            </div>
            <div className="flex items-center gap-x-4">
                <ConnectToADeviceIcon
                    svgDim={{ height: 24, width: 24 }}
                    onClick={(event) => {
                        event.stopPropagation();
                        setShowConnectDevices(prev => !prev)
                    }}
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
                            w-[90%]
                            max-w-[300px]
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
                                                    deviceIcons[getDeviceIcon(user.id, playbackUsers.users) + '-big'].map((d, i) => <path d={d} key={i} width={24} height={24}></path>)
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
                    <Icon size={24} onClick={(e) => {
                        e.stopPropagation();
                        handlePlayback();
                    }} />
            </div>
        </div>
    );
}
 
export default MobilePlayer;