"use client"

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import Box from "./Box";
import SidebarItem from "./SidebarItem";
import Library from "./Library";

interface SidebarProps {
    children: React.ReactNode
}

const Sidebar: React.FC<SidebarProps> = ({ 
    children 
}) => {
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
        <div className="flex h-full p-2 gap-2">
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
                    <Library />
                </Box>
            </div>
            <main className="h-full flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
 
export default Sidebar;