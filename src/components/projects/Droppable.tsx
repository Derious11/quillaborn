"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

export default function Droppable({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[60px] rounded-md",
        isOver ? "ring-1 ring-green-400 bg-gray-800/60" : undefined,
        className
      )}
    >
      {children}
    </div>
  );
}

