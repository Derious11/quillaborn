export function Section({ children, className = "" }) {
  return (
    <section className={`py-12 px-4 md:px-8 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </section>
  );
}
