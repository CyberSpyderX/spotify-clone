"use client"

import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

import { useUser } from "@/hooks/useUser";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import useAuthModal from "@/hooks/useAuthModal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
    songId: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ songId }) => {
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const router = useRouter();
    const { supabaseClient }  = useSessionContext();
    const authModal = useAuthModal();
    const { user } = useUser();
    
    useEffect(() => {
        if(!user?.id) {
            return setIsLiked(false);
        }
        const fetchData = async() => {
            const { data, error } = await supabaseClient
                .from('liked_songs')
                .select('*')
                .eq('user_id', user.id)
                .eq('song_id', songId)
                .single();

            if(!error && data) {
                setIsLiked(true);
            }
        }

        fetchData();
    }, [songId, supabaseClient, user?.id]);

    const Icon = isLiked ? AiFillHeart: AiOutlineHeart;

    const handleLike = async () => {
        if(!user) {
            return authModal.onOpen();
        }

        if(isLiked) {
            const { error } = await supabaseClient
            .from('liked_songs')
            .delete()
            .eq('user_id', user.id)
            .eq('song_id', songId)

            if(error) {
                toast.error(error.message);
            } else {
                setIsLiked(false);
            }
        } else {
            const { data, error} = await supabaseClient
            .from('liked_songs')
            .insert({
                song_id: songId,
                user_id: user?.id
            })
            if(error) {
                toast.error(error.message);
            } else {
                setIsLiked(true);
                toast.success('Song liked!')
            }
        }

        router.refresh();
    }

    return (
        <button 
        onClick={handleLike}
        className="
            hover:opacity-75
            transition
        ">
            <Icon color={isLiked ? '#22c55e' : 'white'} size={25}/>
        </button>
    );
}
 
export default LikeButton;