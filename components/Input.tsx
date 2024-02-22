import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps> (({
    className,
    disabled,
    type,
    placeholder,
    ...props
}, ref) => {
    return (
        <input
            type={type}
            className={twMerge(`
                flex
                w-full
                bg-neutral-700
                border
                border-transparent
                p-3
                rounded-md
                text-sm
                file:border-0
                file:bg-transparent
                file:font-medium
                file:text-sm
                focus:outline-none
                disabled:cursor-not-allowed
                disabled:opacity-50
            `, className)}
            placeholder={placeholder}
            disabled={disabled}
            ref={ref}
            {...props}
        />
    );
});

Input.displayName = "Input";
 
export default Input;