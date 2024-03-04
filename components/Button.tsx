import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps 
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    className,
    children,
    disabled,
    type="button",
    ...props
}, ref) => {
    return (
        <button
            type={type}
            className={twMerge(`
                bg-green-500
                rounded-full
                border
                border-transparent
                p-3
                disabled:cursor-not-allowed
                disabled:opacity-50
                disabled:bg-black
                disabled:text-green-500
                text-black
                font-bold
                hover:opacity-75
                transition
            `, className)}
            disabled={disabled}
            ref={ref}
            {...props}
        >
            {children}
        </button>
    );
})

Button.displayName = "Button";
 
export default Button;