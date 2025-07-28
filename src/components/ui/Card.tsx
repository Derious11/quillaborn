interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-softWhite shadow-md rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}