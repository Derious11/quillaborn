export function Card({ children, className = "" }) {
  return (
    <div className={`bg-softWhite shadow-md rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}