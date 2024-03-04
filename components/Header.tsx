"use client"

import { useRouter } from "next/navigation";
import { BiSearch } from "react-icons/bi";
import { HiHome } from "react-icons/hi";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { twMerge } from "tailwind-merge";
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";

import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";

import Button from "./Button";
import { FaUserAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import usePlayer from "@/hooks/usePlayer";
import usePlaybackUsers from "@/hooks/usePlaybackUsers";
import { supabase } from "@supabase/auth-ui-shared";

interface HeaderProps {
    children: React.ReactNode;
    className?: string;
}
const Header: React.FC<HeaderProps> = ({
    children,
    className
}) => {
    const router = useRouter();
    const { onOpen } = useAuthModal();
    
    const { user, subscription } = useUser();
    const player = usePlayer();
    const playbackUsers = usePlaybackUsers();
    const { supabaseClient, session } = useSessionContext();
    const isActiveDevice = player.activeDeviceIds.includes(player.deviceId);
    const handleLogout = async () => { 
        
        console.log('Logging out!');
        if(isActiveDevice) {
            console.log('This is the active device!');
            console.log('Sending out new activeDeviceIds to ', [...player.activeDeviceIds.filter(id => id !== player.deviceId)]);
            
            supabaseClient.channel(session?.user.email!).send({
                type: 'broadcast',
                event: 'set_player_config',
                payload: { activeDeviceIds: [...player.activeDeviceIds.filter(id => id !== player.deviceId)], playing: false } 
            });
        }
        
        supabaseClient.channel(session?.user.email!).send({
            type: 'broadcast',
            event: 'leaving_user',
            payload: {id: usePlaybackUsers.getState().myUser?.id }
        }).then(resp => { 
            console.log('Leaving user broacast sent for id: ', player.deviceId);
        });
        const { error } = await supabaseClient.auth.signOut();
        player.reset();
        router.refresh();
        
        if(error) {
            toast.error(error.message);
        } else {
            toast.success('Logged out!');
        }
    }

    return (
        <div className={twMerge(`
            h-fit
            bg-gradient-to-b
            from-emerald-800
            p-6
        `, className)}>
            <div className="
                w-full
                flex
                items-center
                justify-between
                mb-4
            ">
                <div className="
                    hidden
                    md:flex
                    gap-x-2
                    items-center
                ">
                    <button 
                      onClick={() => router.back()}
                      className="
                        rounded-full
                        bg-black
                        flex
                        items-center
                        justify-center
                        hover:opacity-75
                        transition
                    ">
                        <RxCaretLeft className="text-white" size={35}/>
                    </button>
                    <button 
                      onClick={() => router.forward()}
                      className="
                        rounded-full
                        bg-black
                        flex
                        items-center
                        justify-center
                        hover:opacity-75
                        transition
                    ">
                        <RxCaretRight className="text-white" size={35}/>
                    </button>
                </div>
                <div className="flex md:hidden gap-x-2 items-center">
                    <button className="
                        bg-white
                        p-2
                        rounded-full
                        flex
                        items-center
                        justify-center
                        hover:opacity-75
                        transition
                    ">
                        <HiHome className="text-black" size={20}/>
                    </button>
                    <button className="
                        bg-white
                        p-2
                        rounded-full
                        flex
                        items-center
                        justify-center
                        hover:opacity-75
                        transition
                    ">
                        <BiSearch className="text-black" size={20}/>
                    </button>
                </div>
                <div className="
                    flex
                    justify-between
                    items-center
                    gap-x-4
                ">
                    {
                        user ? (
                            <>
                                <Button
                                    onClick={handleLogout}
                                    className="bg-white px-6 py-2"
                                >
                                    Logout
                                </Button>
                                <Button
                                    onClick={() => router.push('/account')}
                                    className="bg-white">
                                    <FaUserAlt />
                                </Button>
                            </>
                        ) : 
                            <>
                                <Button 
                                onClick={onOpen}
                                className="
                                    bg-transparent
                                    text-neutral-300
                                    font-medium
                                ">
                                    Sign up
                                </Button>
                                <Button
                                onClick={onOpen} 
                                className="
                                    bg-white
                                    px-6
                                    py-2
                                "
                                >
                                    Log in
                                </Button>
                            </>
                    }
                </div>
            </div>
            {children}
        </div>
    );
}
 
export default Header;