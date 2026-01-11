// src/components/common/Card.tsx
import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-[#1a2632]/90 backdrop-blur-md
                  border border-[#324d67]
                  rounded-xl shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}
