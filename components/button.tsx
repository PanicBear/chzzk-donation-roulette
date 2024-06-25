import { ButtonHTMLAttributes, memo } from 'react';
import { twMerge } from 'tailwind-merge';

const CButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className={
        props.className
          ? props.className
          : twMerge(
              'w-fit h-10',
              'p-2',
              'flex items-center',
              'border-2 border-solid border-black rounded-md',
              'hover:bg-blue-400 hover:text-white'
            )
      }
    />
  );
};

export default memo(CButton);
