import { useState } from "react";
import { Sparkles, PenTool, Users, ArrowRight, MessageCircle, Palette, Zap } from "lucide-react";

export default function App() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // For demo purposes, we'll simulate success
    // Replace with your actual Airtable integration
    setTimeout(() => {
      setSubmitted(true);
      setEmail("");
    }, 500);

    /* Uncomment and configure for actual Airtable integration:
    try {
      const res = await fetch("https://api.airtable.com/v0/{YOUR_BASE_ID}/Waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer {YOUR_AIRTABLE_API_KEY}`,
        },
        body: JSON.stringify({
          fields: {
            Email: email,
          },
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setEmail("");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to submit. Please check your connection.");
    }
    */
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-gray-900" />
            </div>
            <h1 className="text-xl font-bold">Quillaborn</h1>
          </div>
          <nav className="hidden md:flex space-x-8 text-sm font-medium">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#community" className="text-gray-300 hover:text-white transition-colors">Community</a>
            <a href="#waitlist" className="text-gray-300 hover:text-white transition-colors">Join</a>
          </nav>
          <button className="md:hidden text-gray-300 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Section */}
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

            <div id="waitlist" className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
              {!submitted ? (
                <>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="px-6 py-4 rounded-full w-full sm:flex-1 text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-green-500/20 text-center sm:text-left"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    onClick={handleSubmit}
                    className="bg-green-500 hover:bg-green-600 text-gray-900 px-8 py-4 rounded-full font-bold transition-all duration-200 transform hover:scale-105 whitespace-nowrap flex items-center gap-2"
                  >
                    Join Waitlist
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="bg-green-500/20 border border-green-500/30 px-8 py-4 rounded-full">
                  <p className="text-green-300 font-bold text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    You're in! We'll be in touch soon.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <p className="text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg inline-block">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-500/10 rounded-full animate-pulse hidden lg:block"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-green-400/20 rounded-lg rotate-45 animate-bounce hidden lg:block"></div>
        <div className="absolute bottom-20 left-1/4 w-8 h-8 bg-green-300/30 rounded-full animate-ping hidden lg:block"></div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              An <span className="text-green-400">inclusive</span> space with <span className="text-green-400">reliable</span> tech
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Quillaborn makes it easy to connect, collaborate, and create together. Join a community where your creativity matters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-gray-900 p-8 rounded-2xl hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/30 transition-colors">
                <MessageCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Create & Share</h3>
              <p className="text-gray-300 leading-relaxed">
                Share your work, get feedback, and collaborate with creators who understand your vision. No algorithm drama, just real connections.
              </p>
            </div>

            <div className="group bg-gray-900 p-8 rounded-2xl hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/30 transition-colors">
                <Users className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Find Your Tribe</h3>
              <p className="text-gray-300 leading-relaxed">
                Connect with artists, writers, musicians, and dreamers. Build lasting relationships with people who get it.
              </p>
            </div>

            <div className="group bg-gray-900 p-8 rounded-2xl hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/30 transition-colors">
                <Palette className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Build Worlds</h3>
              <p className="text-gray-300 leading-relaxed">
                Whether it's a story, artwork, or wild creative project - bring your ideas to life with the right collaborators.
              </p>
            </div>

            <div className="group bg-gray-900 p-8 rounded-2xl hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/30 transition-colors">
                <Zap className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Launch Together</h3>
              <p className="text-gray-300 leading-relaxed">
                Turn your creative dreams into reality. Get the support, feedback, and momentum you need to make it happen.
              </p>
            </div>

            <div className="group bg-gray-900 p-8 rounded-2xl hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/30 transition-colors">
                <PenTool className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">No Noise Zone</h3>
              <p className="text-gray-300 leading-relaxed">
                Skip the trolls and ghosters. A curated community focused on serious creativity and meaningful collaboration.
              </p>
            </div>

            <div className="group bg-gray-900 p-8 rounded-2xl hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/30 transition-colors">
                <Sparkles className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Creator Tools</h3>
              <p className="text-gray-300 leading-relaxed">
                Access tools designed by creators, for creators. Everything you need to organize projects and grow your creative practice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="community" className="py-20 bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to start your <span className="text-green-400">creative journey?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of creators who are already building something amazing together.
          </p>
          
          {!submitted && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="px-6 py-4 rounded-full w-full sm:flex-1 text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-green-500/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                onClick={handleSubmit}
                className="bg-green-500 hover:bg-green-600 text-gray-900 px-8 py-4 rounded-full font-bold transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
              >
                Join the Community
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-gray-900" />
              </div>
              <span className="text-xl font-bold">Quillaborn</span>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Quillaborn. Built for creators, by creators.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}