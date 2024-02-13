import Link from "next/link";
import { IconType } from "react-icons";
import { twMerge } from "tailwind-merge";

interface SidebarItemProps {
    Icon: IconType;
    label: string;
    active: boolean;
    href: string;
}
const SidebarItem: React.FC<SidebarItemProps> = ({
    Icon,
    label,
    active,
    href
}) => {
    return (
        <div>
            <Link
                href={href}
                className={twMerge(`
                    flex
                    flex-row
                    text-neutral-400
                    w-full
                    gap-x-4
                    h-auto
                    items-center
                    text-md
                    font-medium
                    cursor-pointer
                    hover:text-white
                    transition
                    py-1
                `,
                    active && "text-white"
                )}
            >
                <Icon size={26} />
                <p className="truncate w-full">{label}</p>
            </Link>
        </div>
    );
}
 
export default SidebarItem;