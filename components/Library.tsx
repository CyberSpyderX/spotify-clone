"use client"

import useAuthModal from "@/hooks/useAuthModal";
import useUploadModal from "@/hooks/useUploadModal";
import { useUser } from "@/hooks/useUser";
import { Song } from "@/types";
import { AiOutlinePlus } from "react-icons/ai";
import { TbPlaylist } from "react-icons/tb";
import MediaItem from "./MediaItem";
import useOnPlay from "@/hooks/useOnPlay";

interface LibraryProps {
    songs: Song[];
}

const Library: React.FC<LibraryProps> = ({ songs }) => {
    const authModal = useAuthModal();
    const uploadModal = useUploadModal();
    const onPlay = useOnPlay(songs);
    const { user } = useUser();

    const upload = () => {
        if(!user) {
            return authModal.onOpen();
        }
        
        // TODO: Check for subscription to upload songs

        return uploadModal.onOpen();
    }

    return (
        <div className="flex flex-col">
            <div className="
                flex
                items-center
                justify-between
                px-5
                pt-4
            ">
                <div className="
                    inline-flex
                    items-center
                    gap-x-2
                ">
                    <TbPlaylist className="text-neutral-400" size={26}/>
                    <p className="
                        text-neutral-400
                        font-medium
                        text-md
                    ">Your Library</p>
                </div>
                <AiOutlinePlus 
                    onClick={upload}
                    size={20}
                    className="
                        text-neutral-400
                        cursor-pointer
                        hover:text-white
                        transition
                    " 
                />
            </div>
            <div className="
                flex
                flex-col
                gap-y-2
                mt-4
                px-3
            ">
                {
                    songs.map(song => (
                        <MediaItem song={song} key={song.id} onClick={(id: string) => onPlay(id)}/>
                    ))
                }
            </div>
        </div>

    );
}
 
export default Library;