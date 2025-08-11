interface BadgeProps {
  children: React.ReactNode;
  color?: 'primary' | 'gold' | 'neutral';
}

export function Badge({ children, color = 'primary' }: BadgeProps) {
  const colorMap = {
    primary: 'bg-primary text-white',
    gold: 'bg-gold text-white',
    neutral: 'bg-stone text-ink',
  };
  return (
    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${colorMap[color]}`}>
      {children}
    </span>
  );
}