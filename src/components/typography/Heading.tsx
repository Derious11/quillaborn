interface HeadingProps {
  children: React.ReactNode;
  className?: string;
}

export function Heading({ children, className = "" }: HeadingProps) {
  return (
    <h2 className={`text-2xl font-bold text-white ${className}`}>
      {children}
    </h2>
  );
}