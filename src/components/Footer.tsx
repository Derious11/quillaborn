

export default function Footer() {
  return (
    <footer className="bg-gray-950 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src="/Green_Quill_noback.png" alt="Quillaborn Logo" className="w-8 h-8 brightness-125" />
            <span className="text-xl font-bold text-white">Quillaborn</span>
          </div>
          <div className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Quillaborn. Built for creators, by creators.
          </div>
        </div>
      </div>
    </footer>
  );
} 