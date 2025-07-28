interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export function Section({ children, className = "" }: SectionProps) {
  return (
    <section className={`py-12 px-4 md:px-8 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </section>
  );
}
