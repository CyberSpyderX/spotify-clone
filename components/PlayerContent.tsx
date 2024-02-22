import useSound from "use-sound";

import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";

import { Song } from "@/types";

import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";
import Slider from "./Slider";
import usePlayer from "@/hooks/usePlayer";
import { useEffect, useState } from "react";


interface PlayerContentProps {
    key: string;
    song: Song;
    songUrl: string;
}

const PlayerContent:React.FC<PlayerContentProps> = ({ key, song, songUrl}) => {
    const player = usePlayer();
    const [volume, setVolume] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    
    const Icon = isPlaying ? BsPauseFill : BsPlayFill;
    const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

    console.log(songUrl);
    
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

    const [play, { pause, sound }] = useSound(
        songUrl,
        {
            volume: volume,
            onplay: () => setIsPlaying(true),
            onended: () => {
                setIsPlaying(false);
                onPlayNext();
            },
            onpause: () => setIsPlaying(false),
            format: ['mp3']
        }
    );

    useEffect(() => {
        play();

        return () => {
            sound?.unload();
        }
    }, [ sound]);

    const handlePlay = () => {
        if(isPlaying) {
            pause();
        } else {
            play();
        }
    }

    const toggleMute = () => {
        if(volume===0) {
            setVolume(1);
        } else {
            setVolume(0);
        }
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 h-full">
            <div className="
                flex
                w-full
                justify-start
                items-center
            ">
                <div className="flex gap-x-4">
                    <MediaItem song={song} />
                    <LikeButton songId={song.id} />
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
                <div
                onClick={() => {}} 
                className="
                    h-10
                    w-10
                    flex
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                    text-black
                    p-1
                    cursor-pointer
                ">
                    <Icon size={25} />
                </div>
            </div>
            <div className="
                hidden
                md:flex
                justify-center
                items-center
                w-full
                max-w-[722px]
                gap-x-6
            ">
                <AiFillStepBackward size={25} onClick={onPlayPrevious} className="
                    text-neutral-400
                    cursor-pointer
                    hover:text-white
                    transition
                "/>
                <div
                  onClick={handlePlay} 
                  className="
                    flex
                    items-center
                    justify-center
                    h-10
                    w-10
                    p-1
                    cursor-pointer
                    text-black
                    bg-white
                    rounded-full
                ">
                    <Icon size={25}/>
                </div>
                <AiFillStepForward size={25} onClick={onPlayNext} className="
                    text-neutral-400
                    cursor-pointer
                    hover:text-white
                    transition
                "/>
            </div>
            <div className="hidden md:flex justify-end pr-2 ">
                <div className="flex items-center gap-x-2 w-[120px]">
                    <VolumeIcon onClick={toggleMute} className="cursor-pointer" size={25}/>
                    <Slider
                        value={volume}
                        onChange={(value) => setVolume(volume)}
                    />
                </div>
            </div>
        </div>
    );
}

export default PlayerContent;