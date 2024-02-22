"use client"

import * as Dialog from '@radix-ui/react-dialog';
import { IoMdClose } from 'react-icons/io';

interface ModalProps {
    isOpen: boolean;
    onChange: (open: boolean) => void;
    title: string;
    description: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onChange,
    title,
    description,
    children
}) => {
    return (
        <Dialog.Root
            open={isOpen}
            defaultOpen={isOpen}
            onOpenChange={onChange}
        >
            <Dialog.Portal>
                <Dialog.Overlay 
                  className="
                    bg-neutral-900/90
                    backdrop-blur-sm
                    fixed
                    inset-0
                  "
                />
                <Dialog.Content
                    className="
                        fixed
                        bg-neutral-800
                        drop-shadow-700
                        border
                        border-neutral-700
                        top-[50%]
                        left-[50%]
                        h-full
                        max-h-full
                        md:h-auto
                        md:max-h-[85vh]
                        w-full
                        md:w-[90vw]
                        md:max-w-[450px]
                        translate-x-[-50%]
                        translate-y-[-50%]
                        p-[25px]
                        rounded-md
                        focus:outline-none
                    "
                >
                    <Dialog.Title
                        className="
                            text-xl
                            font-bold
                            text-center
                            mb-4
                        "
                    >
                        {title}
                    </Dialog.Title>
                    <Dialog.Description
                        className="
                            text-sm
                            text-center
                            leading-normal
                            mb-5
                        "
                    >
                        {description}
                    </Dialog.Description>
                    <div className="overflow-y-auto">
                        {children}
                    </div>
                    <Dialog.Close asChild>
                        <button className="
                            text-neutral-400
                            hover:text-white
                            absolute
                            top-[10px]
                            right-[10px]
                            h-[25px]
                            w-[25px]
                            justify-center
                            items-center
                            flex
                            rounded-full
                            focus:outline-none
                        ">
                            <IoMdClose />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
 
export default Modal;