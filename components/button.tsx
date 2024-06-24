import { HTMLAttributes, ReactNode, memo } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
  children: ReactNode;
}

const CButton = ({
  children,
  ...props
}: ButtonProps & HTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className={twMerge(
        "w-24 h-8",
        "bg-blue-500 text-white",
        "hover:bg-blue-300",
        "rounded-md"
      )}
    >
      {children}
    </button>
  );
};

export default memo(CButton);
