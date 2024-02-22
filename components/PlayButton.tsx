import { FaPlay } from "react-icons/fa";

const PlayButton = () => {
    return (
        <button className="
            transition
            opacity-0
            rounded-full
            bg-green-500
            p-3
            flex
            items-center
            drop-shadow-md
            group-hover:opacity-100
            translate
            translate-y-1/4
            group-hover:translate-y-0
            hover:scale-110
        ">
            <FaPlay className="text-black"/>
        </button>
    );
}
 
export default PlayButton;