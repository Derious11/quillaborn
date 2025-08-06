"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface Role {
  id: number;
  name: string;
  created_at: string;
}

interface RolePageProps {
  user: {
    id: string;
    displayName: string;
    username: string;
  };
}

export default function RolePage({ user }: RolePageProps) {
  const { supabase } = useSupabase();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch roles from Supabase
    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from("roles")
          .select("*")
          .order("name");

        if (error) {
          console.error("Error fetching roles:", error);
          setError("Failed to load roles. Please try again.");
        } else {
          setRoles(data || []);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load roles. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [supabase]);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === null) return;

    setSaving(true);
    setError(null);

    try {
      // Insert selected role into profile_roles junction table
      const { error: insertError } = await supabase
        .from("profile_roles")
        .insert({
          profile_id: user.id,
          role_id: selectedRole
        });

      if (insertError) {
        setError("Failed to save role. Please try again.");
        setSaving(false);
        return;
      }

      router.push("/bio");
    } catch (err) {
      setError("Failed to save role. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <span className="text-xl">Loading roles...</span>
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
        
        <div className="relative z-10 bg-gray-800 bg-opacity-90 rounded-2xl shadow-2xl px-8 py-10 max-w-2xl w-full mx-auto text-center">
          <div className="mb-8">
            <span className="inline-block bg-green-500/20 px-4 py-1 rounded-full text-green-400 text-sm font-bold">
              Step 3 of 4
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 flex justify-center items-center gap-2">
            <Sparkles className="text-green-400" /> Choose Your Role
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            What type of creator are you? This helps us connect you with the right community.
          </p>
          
          <form onSubmit={handleNext} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`
                    p-6 rounded-lg border-2 transition-all duration-200 text-left
                    ${selectedRole === role.id
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
                    }
                  `}
                >
                  <h3 className="text-lg font-semibold">{role.name}</h3>
                </button>
              ))}
            </div>
            
            {error && (
              <div className="text-red-400 text-sm mt-4">{error}</div>
            )}
            
            <button
              type="submit"
              disabled={selectedRole === null || saving}
              className="bg-green-500 hover:bg-green-600 text-gray-900 px-8 py-4 rounded-full font-bold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 w-full justify-center disabled:opacity-50"
            >
              {saving ? "Saving..." : <>Complete Setup <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
} 