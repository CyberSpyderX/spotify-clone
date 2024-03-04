"use client"

import { FieldValue, FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import uniqid from "uniqid";

import useUploadModal from "@/hooks/useUploadModal";
import { useUser } from "@/hooks/useUser";

import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import MediaItem from "./MediaItem";
import Image from "next/image";
import SearchedSongItem, { SearchedSong } from "./SearchedSongItem";
import { PulseLoader } from "react-spinners";


const UploadModal = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [gotSpotifyTracks, setGotSpotifyTracks] = useState(false);
    const [uploadType, setUploadType] = useState(0);
    const [onlineSearchResults, setOnlineSearchResults] = useState<SearchedSong[]>([]);
    const supabaseClient = useSupabaseClient();
    const [selectedSong, setSelectedSong] = useState<number>();
    const { user } = useUser();
    const uploadModal = useUploadModal();
    const router = useRouter();
    
    const { register, handleSubmit, reset } = useForm<FieldValues>({
        defaultValues: {
            song: null,
            cover: null,
            title: '',
            artists: '',
        }
    })

    const onChange = (open: boolean) => {
        if(!open) {
            reset();
            setSelectedSong(undefined);
            setOnlineSearchResults([]);
            uploadModal.onClose();
        }
    }

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {

        setIsLoading(true);
        setOnlineSearchResults([]);
        if(!uploadType) {
            if(onlineSearchResults.length > 0 && selectedSong !== undefined) {
                const songData = onlineSearchResults[selectedSong];
                let title = songData.title;
                let artist = songData.artists;
                if(title.indexOf('From') !== -1) {
                    title = title.substring(0, title.indexOf(' From'));
                }
                artist = artist.substring(0, artist.indexOf(' '));
                const query = songData['artists'] + ' - ' + title;
                
                const path = await axios.get('http://localhost:3000/api/getSongFile', {
                    params: {
                        name: query,
                        coverPath: songData.imageUrl,
                        userId: user?.id
                    }
                });
                console.log(path);
                
                if(path.data.error) {
                    return toast.error(path.data.error);
                } 
                
                router.refresh();
                toast.success(path.data.message);
                reset();
                uploadModal.onClose();
            }
            else {
                const title = values.title;
                await axios.get('http://localhost:3000/api/getSpotifyTracks?track='+title)
                    .then(resp => {setOnlineSearchResults(resp.data.tracks)});
                setGotSpotifyTracks(true);
                setSelectedSong(undefined);
            }

        } else {

            try {
                
                const songFile = values.song?.[0];
                const coverFile = values.cover?.[0];

                
                if(!user || !songFile || !coverFile) {
                    toast.error('Missing fields');
                    return;
                }

                console.log( songFile,  coverFile);
                console.log(typeof songFile, typeof coverFile);

                const uniqueId = uniqid();
                const { 
                    data: songData,
                    error: songError,
                } = await supabaseClient
                    .storage
                    .from('songs')
                    .upload(`songs-${values?.title}-${uniqueId}`, songFile, {
                        cacheControl: '3600',
                        upsert: false,
                    })

                if(songError) {
                    return toast.error("Song upload failed!")
                }
                
                const { 
                    data: coverData,
                    error: coverError,
                } = await supabaseClient
                    .storage
                    .from('covers')
                    .upload(`covers-${values?.title}-${uniqueId}`, coverFile, {
                        cacheControl: '3600',
                        upsert: false,
                    })

                if(coverError) {
                    return toast.error("Cover upload failed!")
                }

                const { error: SQLError } = await supabaseClient
                    .from('songs')
                    .insert({
                        user_id: user.id,
                        title: values.title,
                        artists: values.artists,
                        song_path: songData.path,
                        cover_path: coverData.path,
                    });
                
                if(SQLError) {
                    return toast.error(SQLError.message);
                }

                router.refresh();
                toast.success("Song added!");
                reset();
                uploadModal.onClose();

            } catch (err) {
                toast.error("Something went wrong!");
                
            }
        }
        setIsLoading(false);
    }

    return (
        <Modal
            title="Add a song"
            description={!uploadType ? "Search for a song online": "Upload an mp3 file"}
            isOpen={uploadModal.isOpen}
            onChange={onChange}
        >
            <div className="
                flex
                gap-x-2
                bg-neutral-800
                mb-4
            ">
                <div 
                onClick={() => setUploadType(1)}
                className={twMerge(`
                    flex-1
                    items-center
                    justify-center
                    py-3
                    text-center
                    bg-neutral-700
                    rounded-lg
                    cursor-pointer
                `, uploadType ? "bg-customGreen text-black font-semibold" : "")}>
                    Custom
                </div>
                
                <div 
                onClick={() => setUploadType(0)}
                className={twMerge(`
                    flex-1
                    items-center
                    justify-center
                    py-3
                    text-center
                    bg-neutral-700
                    rounded-lg
                    cursor-pointer
                `, !uploadType ? "bg-customGreen text-black font-semibold" : "")}>
                    Online
                </div>                
            </div>
            {
                uploadType ?
                <form onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-y-4"    
                >
                    <Input
                        id="title"
                        disabled={isLoading}
                        placeholder="Enter song title"
                        {...register('title', { required: true })}
                    />
                    <Input
                        id="artists"
                        disabled={isLoading}
                        placeholder="Enter artists"
                        {...register('artists', { required: true })}
                    />
                    <div>
                        <div className="text-sm mb-1">
                            Select the song file
                        </div>
                        <Input 
                            id="song"
                            type="file"
                            disabled={isLoading}
                            accept=".mp3"
                            className="cursor-pointer"
                            {...register('song', { required: true })}
                        />
                    </div>
                    <div>
                        <div className="text-sm mb-1">
                            Select the song cover
                        </div>
                        <Input 
                            id="cover"
                            type="file"
                            disabled={isLoading}
                            accept="image/*"
                            className="cursor-pointer"
                            {...register('cover', { required: true })}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading}>Create</Button>
                </form> : 
                <form onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-y-4"    
                >
                    <Input
                        id="title"
                        disabled={isLoading}
                        placeholder="Enter song title"
                        {...register('title', { required: true })}
                    />
                    {
                        onlineSearchResults.length ? 
                            onlineSearchResults.map((item: SearchedSong, idx) => (
                                <SearchedSongItem 
                                    song={item} 
                                    key={idx}
                                    isSelected={selectedSong === idx}
                                    onClick={() => setSelectedSong(idx)}/>
                                
                            ))
                        : null
                    }
                    <div className="flex gap-2">
                        { onlineSearchResults.length ? 
                            <Button
                                className="flex-1"
                                type="submit"
                            >
                                Search
                            </Button>
                            : null
                        }
                        <Button
                            className="flex-1"
                            disabled={isLoading || 
                                (onlineSearchResults.length !== 0 && 
                                selectedSong === undefined)}
                            type="submit">
                                {isLoading ? 
                                <PulseLoader color="green" /> : 
                                (gotSpotifyTracks ? ('Upload Song'): 'Search')}
                        </Button>
                    </div>
                </form>
                }
        </Modal>
    );
}
 
export default UploadModal;