import { PlaybackUser } from "@/hooks/usePlaybackUsers";
import { BroadcastPlayerStore, PlayerStore } from "@/hooks/usePlayer";

export const getSecondsToMins: (value: number) => string = (value) => {
    return `${Math.trunc(value/60)}:${(value%60).toString().padStart(2, '0')}`;
}

export const getDeviceType: (userAgent: string, platform?: string, isBrave?: boolean) => { device_type: string, device_type_icon: string} = (userAgent, platform, isBrave) => {
    console.log(userAgent, platform);
    
    if(isBrave) {
        return { device_type: 'Web Player (Brave)', device_type_icon: 'Web'};
    }
    
    let deviceType = { device_type: 'Web Player', device_type_icon: 'Web' };

    const isWindows = (platform && platform.toLowerCase() === 'win32') || 
        userAgent.indexOf('Windows') !== -1;
    
    if(isWindows) {
        if(userAgent.indexOf('Chrome') !== -1) {
            return { device_type: 'Web Player (Chrome)', device_type_icon: 'Web'};
        } else {
            return { device_type: 'Web Player (Windows)', device_type_icon: 'Web'};
        }
    }
    
    if(platform && platform.toLowerCase() === 'iphone') {
        return { device_type: 'iPhone', device_type_icon: 'iPhone'};
    }
    
    const isiPad = (navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    if(isiPad) {
        return { device_type: 'iPad', device_type_icon: 'iPad'};
    }

    if(navigator.userAgent.includes('Android')) {
        return { device_type: 'Mobile Web Player', device_type_icon: 'iPhone' };
    }
    return deviceType;
}

export function getDeviceIcon(id: string, users: PlaybackUser[]): string {
    console.log(id, users, users.find(user => user.id === id)?.device_type_icon ?? '');
    
    return users.find(user => user.id === id)?.device_type_icon ?? '';
}
export function getDeviceTypeString(id: string, users: PlaybackUser[]): string {
    console.log(id, users, users.find(user => user.id === id)?.device_type ?? '');
    
    return users.find(user => user.id === id)?.device_type ?? '';
}
export const getBroadcastPlayer = (player: PlayerStore): BroadcastPlayerStore => {
    return {
        ids: player.ids,
        activeId: player.activeId,
        playing: player.playing,
        volume: player.volume,
        shuffle: player.shuffle,
        repeat: player.repeat,
        muted: player.muted,
        activeDeviceIds: player.activeDeviceIds,
        playbackTime: player.playbackTime,
    }
}