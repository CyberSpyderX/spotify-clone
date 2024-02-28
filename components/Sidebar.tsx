"use client"

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";

import Box from "./Box";
import SidebarItem from "./SidebarItem";
import Library from "./Library";

import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";
import { twMerge } from "tailwind-merge";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { RealtimeChannel } from "@supabase/supabase-js";

interface SidebarProps {
    children: React.ReactNode;
    songs: Song[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
    children,
    songs
}) => {
    const {supabaseClient: supabase, session} = useSessionContext();
    const [email, setEmail] = useState('')

    let playbackChannel = useRef<RealtimeChannel>();
    let pbChannelUser = useRef<RealtimeChannel>();
    let pbChannelPlayerCfg = useRef<RealtimeChannel>();

    const player = usePlayer();
    
    const pathname = usePathname();

    const routes = useMemo(() => [
        {
            label: "Home",
            active: pathname !== "/search",
            href: '/',
            Icon: HiHome,
        }, 
        {
            label: "Search",
            active: pathname === "/search",
            href: '/search',
            Icon: BiSearch,
        }
    ], [pathname]);

    return (
        <div className={twMerge(`flex h-full p-2 gap-2 pb-0`,
            `h-[calc(100%-${player.activeId ? (player.deviceId !== player.activeDeviceId ? 112 : 80) : 0} px)]`
            
        )}>
            <div className="
                hidden
                md:flex
                bg-black
                flex-col
                gap-y-2
                h-full
                w-[300px]
            ">
                <Box>
                    <div className="
                        flex
                        flex-col
                        gap-y-4
                        px-5
                        py-4
                    ">
                        {routes.map( route => (
                            <SidebarItem 
                                key={route.label}
                                {...route}
                            />
                        ))}
                    </div>
                </Box>
                <Box className="
                    overflow-y-auto
                    h-full
                ">
                    <Library songs={songs} />
                </Box>
            </div>
            <main className="h-full flex-1 overflow-y-auto rounded-lg">
                {children}
            </main>
        </div>
    );
}
 
export default Sidebar;