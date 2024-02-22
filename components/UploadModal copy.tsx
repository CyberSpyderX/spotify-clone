"use client"

import { FieldValue, FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";
import toast from "react-hot-toast";
import uniqid from "uniqid";

import useUploadModal from "@/hooks/useUploadModal";
import { useUser } from "@/hooks/useUser";

import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { useRouter } from "next/navigation";


const UploadModal = () => {
    const [isLoading, setIsLoading] = useState(false);
    const supabaseClient = useSupabaseClient();
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
            uploadModal.onClose();
        }
    }

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try {
            setIsLoading(true);
            
            const songFile = values.song?.[0];
            const coverFile = values.cover?.[0];

            if(!user || !songFile || !coverFile) {
                toast.error('Missing fields');
                return;
            }
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
            
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Modal
            title="Add a song"
            description="Upload an mp3 file"
            isOpen={uploadModal.isOpen}
            onChange={onChange}
        >
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
            </form>   
        </Modal>
    );
}
 
export default UploadModal;