export function Heading({ children }) {
  return (
    <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
      {children}
    </h1>
  );
}