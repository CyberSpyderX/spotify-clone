"use client"

import * as RadixSlider from "@radix-ui/react-slider";

interface SliderProps {
    value?: number;
    onChange ?: (value: number, commit?: boolean) => void;
}

const Slider: React.FC<SliderProps> = ({ value = 1,onChange }) => {

    return (
        <RadixSlider.Root className="
            relative
            flex
            items-center
            w-full
            py-1
            group
        "
        defaultValue={[0.5]}
        value={[value]}
        onValueChange={(val) => onChange?.(val[0])}
        onValueCommit={(val) => onChange?.(val[0], true)}
        max={1}
        step={0.01}
        aria-label="Volume"
        >
            <RadixSlider.Track className="
                bg-neutral-600
                relative
                grow
                rounded-full
                h-[4px]
            ">
                <RadixSlider.Range className="
                    absolute
                    bg-white
                    group-hover:bg-customGreen
                    h-full
                    rounded-full
                ">
                </RadixSlider.Range>
            </RadixSlider.Track>
            <RadixSlider.Thumb className="
                h-[10px] 
                w-[10px]
                hidden
                cursor-pointer
                group-hover:block 
                bg-white
                rounded-full
            " aria-label="Volume" />
        </RadixSlider.Root>
    );
}
 
export default Slider;