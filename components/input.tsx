import { InputHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  return (
    <input
      {...props}
      ref={ref}
      className={
        props.className
          ? props.className
          : twMerge(
              "max-w-80 w-full h-10",
              "p-2",
              "border-2 border-solid border-black rounded-md"
            )
      }
    />
  );
});

Input.displayName = "Input";

export default Input;
