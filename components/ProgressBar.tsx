import { getSecondsToMins } from "@/libs/utils";
import * as Slider from '@radix-ui/react-slider';
import { useState } from "react";

interface ProgressBarProps {
    elapsedTime: number
    duration: number;
    handleProgressChange: (value: number[], commit?: boolean) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ elapsedTime, duration = 0, handleProgressChange}) => {
    return (
        <div className="
            flex
            gap-x-2
            py-1
            my-1
            group
            justify-center
            items-center
            w-full
        ">
            <div className="text-[12px] text-neutral-400 font-semibold">
                {getSecondsToMins(elapsedTime)}
            </div>
            <Slider.Root 
                min={0}
                max={duration}
                step={0.1}
                value={[elapsedTime]}
                defaultValue={[elapsedTime]}
                onValueChange={val => handleProgressChange(val)}
                onValueCommit={(val) => handleProgressChange(val, true)}
                aria-label="Volume"
                className="
                    relative
                    flex 
                    w-[70%]
                    h-[4px]
                    rounded-full
                    group
                ">
                <Slider.Track className="
                    bg-neutral-600
                    relative
                    flex
                    items-center
                    rounded-full
                    grow
                ">
                    <Slider.Range className="
                        bg-white
                        group-hover:bg-customGreen
                        h-full
                        rounded-full
                        absolute
                    ">
                    </Slider.Range>
                    <Slider.Thumb className="h-[10px] w-[10px] rounded-full hidden group-hover:block group-hover:bg-white" aria-label="Seek" />
                </Slider.Track>
            </Slider.Root>
            <div className="text-[12px] text-neutral-400 font-semibold">
                {getSecondsToMins(duration)}
            </div>
        </div>
    );
}
 
export default ProgressBar;