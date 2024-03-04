import usePlaybackUsers, { PlaybackUser } from "@/hooks/usePlaybackUsers";
import { PlayerStore } from "@/hooks/usePlayer";
import { RealtimeChannel } from "@supabase/supabase-js";
import Image from "next/image";
import { useRef } from "react";
import { FaRegPauseCircle } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

interface IconContainerProps {
    children?: React.ReactNode;
    iconSvgPath?: string[];
    style?: string;
    onClick?: (id?: string) => void;
}
interface VolumeIconProps
    extends IconContainerProps {
        volume: number;
}

interface ConnectToADeviceIconProps 
    extends IconContainerProps {
        type: 'iPad' | 'iPhone' | 'Web' | 'Off' | 'Multiple';
        users: PlaybackUser[];
        channel: RealtimeChannel;
        player: PlayerStore;
}

interface ShuffleIconProps
    extends IconContainerProps {
        state: boolean;
}

interface RepeatIconProps
    extends IconContainerProps {
        state: string;
}

export const IconContainer: React.FC<IconContainerProps>  = ({ children, style, onClick, iconSvgPath }) => {
    
    return (
        <div onClick={onClick} className={twMerge(`
        h-8 
        w-8 
        flex 
        flex-col
        items-center 
        justify-center
        transition`, style)}>
            <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                className="flex justify-center items-center"
                xmlns="http://www.w3.org/2000/svg"
            >
                {
                    iconSvgPath?.length &&
                        iconSvgPath.map((path, idx) => <path key={idx} d={path}></path>)
                }
            </svg>
            {children}
        </div>
    );
}

export const ShuffleIcon: React.FC<ShuffleIconProps> = ({ state, onClick }) => {
    return (
        <IconContainer 
            style={state ? 'fill-customGreen relative' : 'fill-neutral-400 hover:fill-white'}
            onClick={onClick}
            iconSvgPath={["M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z", 
                "m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z"]}
        >
            {state && <div className="w-[4px] h-[4px] absolute bottom-[-4px] bg-customGreen rounded-full"></div>}
        </IconContainer>
    );
}

export const PreviousIcon: React.FC<IconContainerProps> = ({ onClick }) => {
    return (
        <IconContainer
            style="fill-neutral-400 hover:fill-white cursor-pointer" 
            iconSvgPath={["M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z"]}
            onClick={onClick}
        />
    );
}

export const NextIcon: React.FC<IconContainerProps> = ({ onClick }) => {
    return (
        <IconContainer
            style="fill-neutral-400 hover:fill-white cursor-pointer" 
            iconSvgPath={["M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"]}
            onClick={onClick}
        />
    );
}

export const RepeatIcon: React.FC<RepeatIconProps> = ({ state, onClick }) => {
    
    let style, iconSvgPath;
    switch(state) {
        case 'off':
            style = "fill-neutral-400 hover:fill-white cursor-pointer";
            iconSvgPath = ["M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"];
            break;
        
        case 'all':
            style = "fill-customGreen cursor-pointer relative";
            iconSvgPath = ["M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"];
            break;

        case 'one':
            style = "fill-customGreen cursor-pointer relative";
            iconSvgPath = ["M0 4.75A3.75 3.75 0 0 1 3.75 1h.75v1.5h-.75A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5zM12.25 2.5h-.75V1h.75A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25z", "M9.12 8V1H7.787c-.128.72-.76 1.293-1.787 1.313V3.36h1.57V8h1.55z"];
            break;
    }

    return (
        <IconContainer
            style={style}
            iconSvgPath={iconSvgPath}
            onClick={onClick}
        >
             {state!=='off' && <div className="w-[4px] h-[4px] absolute bottom-[-4px] bg-customGreen rounded-full"></div>}
        </IconContainer>
    );
}

export const VolumeIcon: React.FC<VolumeIconProps> = ({ volume, onClick }) => {
    const style = 'cursor-pointer fill-neutral-400 hover:fill-white transition';
    let iconSvgPath = [];
    if (volume === 0) {
        iconSvgPath = ['M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z',
                'M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.73 4.73 0 0 1-1.5-.694v1.3L2.817 9.852a2.141 2.141 0 0 1-.781-2.92c.187-.324.456-.594.78-.782l5.8-3.35v1.3c.45-.313.956-.55 1.5-.694V1.5z'];
    } else {
        iconSvgPath = ['M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z',
                'M11.5 13.614a5.752 5.752 0 0 0 0-11.228v1.55a4.252 4.252 0 0 1 0 8.127v1.55z'];                
    }

    return (
        <IconContainer 
            style={style}
            iconSvgPath={iconSvgPath}
            onClick={onClick}
        />
    );
}
export const deviceIcons = {
    'iPad': ['M1 1.75C1 .784 1.784 0 2.75 0h10.5C14.216 0 15 .784 15 1.75v12.5A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25V1.75zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H2.75z',
    'M9 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0z'],
    'iPhone': ['M8 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z', 'M4.75 0A1.75 1.75 0 0 0 3 1.75v12.5c0 .966.784 1.75 1.75 1.75h6.5A1.75 1.75 0 0 0 13 14.25V1.75A1.75 1.75 0 0 0 11.25 0h-6.5zM4.5 1.75a.25.25 0 0 1 .25-.25h6.5a.25.25 0 0 1 .25.25v12.5a.25.25 0 0 1-.25.25h-6.5a.25.25 0 0 1-.25-.25V1.75z'],
    'Web': ['M2 3.75C2 2.784 2.784 2 3.75 2h8.5c.966 0 1.75.784 1.75 1.75v6.5A1.75 1.75 0 0 1 12.25 12h-8.5A1.75 1.75 0 0 1 2 10.25v-6.5zm1.75-.25a.25.25 0 0 0-.25.25v6.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-6.5a.25.25 0 0 0-.25-.25h-8.5zM.25 15.25A.75.75 0 0 1 1 14.5h14a.75.75 0 0 1 0 1.5H1a.75.75 0 0 1-.75-.75z'],
    'Off': ['M6 2.75C6 1.784 6.784 1 7.75 1h6.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 14.25 15h-6.5A1.75 1.75 0 0 1 6 13.25V2.75zm1.75-.25a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h6.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25h-6.5zm-6 0a.25.25 0 0 0-.25.25v6.5c0 .138.112.25.25.25H4V11H1.75A1.75 1.75 0 0 1 0 9.25v-6.5C0 1.784.784 1 1.75 1H4v1.5H1.75zM4 15H2v-1.5h2V15z',
    'M13 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-1-5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z'],
    'Multiple': ['M 7.8002 11 C 7.2479 11 6.8002 11.4477 6.8002 12 C 6.8002 12.5523 7.2479 13 7.8002 13 V 11 Z M 7.8102 13 C 8.3625 13 8.8102 12.5523 8.8102 12 C 8.8102 11.4477 8.3625 11 7.8102 11 V 13 Z M 10.4907 9.04 C 10.8993 9.4116 11.5317 9.3817 11.9033 8.9732 C 12.275 8.5646 12.245 7.9322 11.8365 7.5605 L 10.4907 9.04 Z M 13.8541 5.3403 C 14.2626 5.7119 14.8951 5.682 15.2667 5.2734 C 15.6384 4.8649 15.6084 4.2324 15.1999 3.8608 L 13.8541 5.3403 Z M 3.7639 7.5605 C 3.3554 7.9322 3.3255 8.5646 3.6971 8.9732 C 4.0687 9.3817 4.7012 9.4116 5.1097 9.04 L 3.7639 7.5605 Z M 0.4006 3.8608 C -0.008 4.2324 -0.0379 4.8649 0.3337 5.2734 C 0.7053 5.682 1.3378 5.7119 1.7463 5.3403 L 0.4006 3.8608 Z M 7.8002 13 H 7.8102 V 11 H 7.8002 V 13 Z M 7.8002 8 C 8.8369 8 9.7795 8.3931 10.4907 9.04 L 11.8365 7.5605 C 10.7715 6.5918 9.3538 6 7.8002 6 V 8 Z M 7.8002 3 C 10.1321 3 12.2548 3.8855 13.8541 5.3403 L 15.1999 3.8608 C 13.2468 2.0842 10.6489 1 7.8002 1 V 3 Z M 5.1097 9.04 C 5.8209 8.3931 6.7635 8 7.8002 8 V 6 C 6.2466 6 4.8289 6.5918 3.7639 7.5605 L 5.1097 9.04 Z M 1.7463 5.3403 c 1.5993 -1.4548 3.722 -2.3403 6.0539 -2.3403 v -2 c -2.8487 0 -5.4465 1.0842 -7.3996 2.8608 l 1.3458 1.4795 Z'],
    'iPhone-big': ['M5 5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5zm3-1a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H8z', 'M13.25 16.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0z'],
    'iPad-big': ['M3 5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5zm3-1a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H6z', 'M13.25 16.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0z'],
    'Web-big': ['M0 21a1 1 0 0 1 1-1h22a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1zM3 5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5zm3-1a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H6z']
}
export const ConnectToADeviceIcon: React.FC<ConnectToADeviceIconProps> = ({ onClick, type, children }) => {
    let style = "cursor-pointer fill-[#1db954]"; 
    
    let iconSvgPath = deviceIcons[type];

    // function handleClick(id: string) {
    //     channel.send({
    //         type: 'broadcast',
    //         event: 'set_player_config',
    //         payload: { activeDeviceId: id, originatedBy: 'all', playbackTime: songElapsedTime }
    //     }).then(resp => { console.log(` Active device changed to ${id} and playbacktime: ${songElapsedTime} ; Resp`, resp) });
    // }

    return (
        <IconContainer
            style={style}
            iconSvgPath={iconSvgPath}
            onClick={onClick}
        >
            {children}
        </IconContainer>
    );
}

export const PlayingOnOtherDeviceIcon: React.FC<IconContainerProps> = () => {
    let iconSvgPath = ['M14.5 8a6.468 6.468 0 0 0-1.3-3.9l1.2-.9C15.405 4.537 16 6.2 16 8c0 1.8-.595 3.463-1.6 4.8l-1.2-.9A6.468 6.468 0 0 0 14.5 8zM8 1.5a6.5 6.5 0 1 0 3.25 12.13.75.75 0 1 1 .75 1.3 8 8 0 1 1 0-13.86.75.75 0 1 1-.75 1.298A6.467 6.467 0 0 0 8 1.5z',
                        'M11.259 8c0-.676-.228-1.296-.611-1.791l1.187-.918c.579.749.924 1.69.924 2.709a4.41 4.41 0 0 1-.925 2.709l-1.186-.918c.383-.495.61-1.115.61-1.791zM8.75 4.115l-4.139 2.39a1.727 1.727 0 0 0 0 2.99l4.139 2.39v-7.77z'];
    
    return (
        <IconContainer
            style="h-4 w-4"
            iconSvgPath={iconSvgPath}
        />
    )

}