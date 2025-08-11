import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ExploreContent from '@/components/features/explore/ExploreContent';

export default function Explore() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900 to-gray-900" />
        <div className="absolute inset-0 opacity-50 bg-gray-900" />
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <ExploreContent />
        </div>
      </main>
      <Footer />
    </div>
  );
}
