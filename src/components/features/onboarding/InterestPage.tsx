"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface Interest {
  id: number;
  name: string;
  created_at: string;
}

interface InterestPageProps {
  user: {
    id: string;
    displayName: string;
    username: string;
  };
}

export default function InterestPage({ user }: InterestPageProps) {
  const { supabase } = useSupabase();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch interests from Supabase
    const fetchInterests = async () => {
      try {
        const { data, error } = await supabase
          .from("interests")
          .select("*")
          .order("name");

        if (error) {
          console.error("Error fetching interests:", error);
          setError("Failed to load interests. Please try again.");
        } else {
          setInterests(data || []);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load interests. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, [supabase]);

  const handleInterestToggle = (interestId: number) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInterests.length === 0) {
      setError("Please select at least one interest.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Insert selected interests into profile_interests junction table
      const interestRecords = selectedInterests.map(interestId => ({
        profile_id: user.id,
        interest_id: interestId
      }));

      const { error: insertError } = await supabase
        .from("profile_interests")
        .insert(interestRecords);

      if (insertError) {
        setError("Failed to save interests. Please try again.");
        setSaving(false);
        return;
      }

      router.push("/role");
    } catch (err) {
      setError("Failed to save interests. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <span className="text-xl">Loading interests...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header onJoinWaitlist={() => {}} />
      <main className="flex-grow flex flex-col justify-center items-center relative overflow-hidden">
        {/* Gradient overlays for on-brand look */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900 to-gray-900 pointer-events-none z-0"></div>
        <div className="absolute inset-0 opacity-50 bg-gray-900 pointer-events-none z-0"></div>
        
        <div className="relative z-10 bg-gray-800 bg-opacity-90 rounded-2xl shadow-2xl px-8 py-10 max-w-4xl w-full mx-auto text-center">
          <div className="mb-8">
            <span className="inline-block bg-green-500/20 px-4 py-1 rounded-full text-green-400 text-sm font-bold">
              Step 2 of 4
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 flex justify-center items-center gap-2">
            <Sparkles className="text-green-400" /> What Interests You?
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Select your creative interests to help us connect you with like-minded creators.
          </p>
          
          <form onSubmit={handleNext} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interests.map((interest) => (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => handleInterestToggle(interest.id)}
                  className={`
                    p-6 rounded-lg border-2 transition-all duration-200 text-center
                    ${selectedInterests.includes(interest.id)
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
                    }
                  `}
                >
                  <h4 className="font-semibold text-lg">{interest.name}</h4>
                </button>
              ))}
            </div>
            
            {error && (
              <div className="text-red-400 text-sm mt-4">{error}</div>
            )}
            
            <div className="text-sm text-gray-400">
              Selected: {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''}
            </div>
            
            <button
              type="submit"
              disabled={selectedInterests.length === 0 || saving}
              className="bg-green-500 hover:bg-green-600 text-gray-900 px-8 py-4 rounded-full font-bold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 w-full justify-center disabled:opacity-50"
            >
              {saving ? "Saving..." : <>Continue <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
} 