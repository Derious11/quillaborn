import Header from "./Header";
import Footer from "./Footer";
import ClientLandingPage from "./ClientLandingPage";

export default function ServerLandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header onJoinWaitlist={() => {}} />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900 to-gray-900"></div>
        <div className="absolute inset-0 opacity-50 bg-gray-900"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
              <span className="text-white">IMAGINE A PLACE...</span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                for creators
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              ...where you can belong to a creative community. Where you can collaborate with fellow artists, writers, and dreamers. Where talking about your next big project is just as easy as sharing your latest work.
            </p>
            <ClientLandingPage />
          </div>
        </div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-500/10 rounded-full animate-pulse hidden lg:block"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-green-400/20 rounded-lg rotate-45 animate-bounce hidden lg:block"></div>
        <div className="absolute bottom-20 left-1/4 w-8 h-8 bg-green-300/30 rounded-full animate-ping hidden lg:block"></div>
      </main>
      <Footer />
    </div>
  );
} 