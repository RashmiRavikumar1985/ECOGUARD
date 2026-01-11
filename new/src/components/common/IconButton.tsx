// src/components/common/IconButton.tsx
import { ReactNode } from "react";

type IconButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  title?: string;
};

export function IconButton({
  children,
  onClick,
  title,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center h-10 w-10
                 rounded-lg bg-[#1a2632]/90
                 border border-[#324d67]
                 text-white backdrop-blur-md
                 hover:bg-primary hover:border-primary
                 transition-colors shadow-lg"
    >
      {children}
    </button>
  );
}
