// components/blog/Callout.tsx
export default function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-8 p-6 bg-gradient-to-br from-green-500/10 via-gray-800/80 to-gray-900 border-l-4 border-green-400 rounded-xl shadow-lg">
      <p className="text-lg text-gray-100 italic leading-relaxed">
        {children}
      </p>
    </div>
  );
}
