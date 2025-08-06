"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface UsernamePageProps {
  user: {
    id: string;
    displayName?: string;
    username?: string;
    email?: string;
  };
}

// Reserved words that cannot be used as usernames
const RESERVED_WORDS = [
  'admin', 'administrator', 'support', 'help', 'info', 'contact', 'team',
  'staff', 'moderator', 'mod', 'system', 'root', 'user', 'test', 'demo',
  'example', 'sample', 'quillaborn', 'quill', 'api', 'www', 'mail',
  'webmaster', 'hostmaster', 'postmaster', 'abuse', 'security', 'noreply',
  'no-reply', 'donotreply', 'do-not-reply', 'nobody', 'anonymous'
];

export default function UsernamePage({ user }: UsernamePageProps) {
  const { supabase } = useSupabase();
  const router = useRouter();

  // Generate username suggestion from email
  const generateUsernameFromEmail = (email: string) => {
    if (!email) return "quill_user";
    
    // Extract username part from email (before @)
    const emailUsername = email.split('@')[0];
    
    // Clean the username: lowercase, replace special chars with dots/underscores
    let cleaned = emailUsername
      .toLowerCase()
      .replace(/[^a-z0-9]/g, (match) => {
        // Replace common special characters with dots or underscores
        if (['.', '-', '_'].includes(match)) return match;
        if (match === ' ') return '_';
        return '.';
      })
      .replace(/[^a-z0-9._]/g, '') // Remove any remaining special chars
      .replace(/[._]+/g, '.') // Replace multiple dots/underscores with single dot
      .replace(/^[._]+|[._]+$/g, ''); // Remove leading/trailing dots/underscores
    
    // Ensure it's not all numbers
    if (/^\d+$/.test(cleaned)) {
      cleaned = cleaned + 'user';
    }
    
    // Ensure minimum length
    if (cleaned.length < 6) {
      cleaned = cleaned + 'user';
    }
    
    // Ensure maximum length
    if (cleaned.length > 20) {
      cleaned = cleaned.substring(0, 20);
    }
    
    return cleaned || "quill_user";
  };

  const suggested = user?.username || generateUsernameFromEmail(user?.email || "");

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [username, setUsername] = useState(suggested);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Username validation function
  const validateUsername = (username: string): string[] => {
    const errors: string[] = [];
    
    if (!username) {
      errors.push("Username is required");
      return errors;
    }

    // Check length
    if (username.length < 6) {
      errors.push("Username must be at least 6 characters");
    }
    if (username.length > 20) {
      errors.push("Username must be 20 characters or less");
    }

    // Check for spaces
    if (username.includes(' ')) {
      errors.push("Username cannot contain spaces");
    }

    // Check for invalid characters (only alphanumeric, dots, and underscores allowed)
    if (!/^[a-z0-9._]+$/.test(username)) {
      errors.push("Username can only contain lowercase letters, numbers, dots, and underscores");
    }

    // Check if it's all numbers
    if (/^\d+$/.test(username)) {
      errors.push("Username cannot be all numbers");
    }

    // Check for reserved words
    if (RESERVED_WORDS.includes(username.toLowerCase())) {
      errors.push("Username is reserved and cannot be used");
    }

    // Check for consecutive dots or underscores
    if (/[._]{2,}/.test(username)) {
      errors.push("Username cannot have consecutive dots or underscores");
    }

    // Check for leading/trailing dots or underscores
    if (/^[._]|[._]$/.test(username)) {
      errors.push("Username cannot start or end with dots or underscores");
    }

    return errors;
  };

  // Real-time username validation and availability check
  useEffect(() => {
    if (!username) {
      setAvailable(null);
      setError(null);
      setValidationErrors([]);
      return;
    }

    // Validate username first
    const validationErrors = validateUsername(username);
    setValidationErrors(validationErrors);

    // If there are validation errors, don't check availability
    if (validationErrors.length > 0) {
      setAvailable(false);
      setError(null);
      return;
    }

    // Prevent check if user types their own (unchanged) username
    if (username === user.username) {
      setAvailable(true);
      setError(null);
      return;
    }

    setChecking(true);
    setAvailable(null);
    setError(null);

    const timer = setTimeout(async () => {
      const { data, error: supaError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", user.id)
        .maybeSingle();

      if (supaError) {
        setAvailable(false);
        setError("Error checking username. Please try again.");
      } else if (data) {
        setAvailable(false);
        setError("Username is already taken.");
      } else {
        setAvailable(true);
        setError(null);
      }
      setChecking(false);
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [username, user.id, user.username]);

  // Handle submit (update profile)
  const handleNext = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!available || !username || !displayName.trim() || validationErrors.length > 0) return;
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        username,
        display_name: displayName.trim()
      })
      .eq("id", user.id);

    setSaving(false);

    if (updateError) {
      setError("Failed to save profile. Please try again.");
      return;
    }

    router.push("/interest");
  };

  const isUsernameValid = validationErrors.length === 0 && available === true;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header onJoinWaitlist={() => {}} />
      <main className="flex-grow flex flex-col justify-center items-center relative overflow-hidden">
        {/* Gradient overlays for on-brand look */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900 to-gray-900 pointer-events-none z-0"></div>
        <div className="absolute inset-0 opacity-50 bg-gray-900 pointer-events-none z-0"></div>
        
        <div className="relative z-10 bg-gray-800 bg-opacity-90 rounded-2xl shadow-2xl px-8 py-10 max-w-lg w-full mx-auto text-center">
          <div className="mb-8">
            <span className="inline-block bg-green-500/20 px-4 py-1 rounded-full text-green-400 text-sm font-bold">
              Step 1 of 4
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 flex justify-center items-center gap-2">
            <Sparkles className="text-green-400" /> Welcome, {user?.displayName || "creator"}!
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            Choose your display name and unique username.
          </p>
          <form onSubmit={handleNext} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2 text-left">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  className="w-full px-6 py-4 rounded-full text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-green-500/20 text-center font-bold text-xl"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                  placeholder="Your display name"
                  required
                  disabled={saving}
                />
                <p className="text-xs text-gray-400 mt-1 text-left">
                  This is how others will see your name
                </p>
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2 text-left">
                  Username
                </label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    className={`w-full px-6 py-4 rounded-full text-gray-900 bg-white focus:outline-none focus:ring-4 text-center font-bold text-xl transition-all duration-200 ${
                      isUsernameValid 
                        ? 'focus:ring-green-500/20 border-2 border-green-500' 
                        : username && !checking
                        ? 'focus:ring-red-500/20 border-2 border-red-500'
                        : 'focus:ring-green-500/20'
                    }`}
                    value={username}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase();
                      // Only allow valid characters
                      const cleaned = value.replace(/[^a-z0-9._]/g, '');
                      setUsername(cleaned);
                    }}
                    maxLength={20}
                    placeholder="username"
                    required
                    disabled={saving}
                  />
                  {/* Status indicator */}
                  {username && !checking && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      {isUsernameValid ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                  {checking && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                    </div>
                  )}
                </div>
                
                {/* Validation feedback */}
                {validationErrors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {validationErrors.map((error, index) => (
                      <div key={index} className="flex items-center gap-2 text-red-400 text-sm">
                        <XCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {available === true && !checking && validationErrors.length === 0 && (
                  <div className="flex items-center gap-2 text-green-400 text-sm mt-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Username is available!</span>
                  </div>
                )}
                
                {available === false && !checking && validationErrors.length === 0 && (
                  <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                    <XCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-400 text-left">
                    <strong>Username rules:</strong>
                  </p>
                  <ul className="text-xs text-gray-400 text-left space-y-1">
                    <li>• 6-20 characters long</li>
                    <li>• Lowercase letters, numbers, dots, and underscores only</li>
                    <li>• No spaces or special symbols</li>
                    <li>• Cannot be all numbers</li>
                    <li>• Cannot start or end with dots or underscores</li>
                    <li>• No consecutive dots or underscores</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!username || !isUsernameValid || !displayName.trim() || saving}
              className="bg-green-500 hover:bg-green-600 text-gray-900 px-8 py-4 rounded-full font-bold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 w-full justify-center disabled:opacity-50"
            >
              {saving ? "Saving..." : <>Continue <ArrowRight className="w-5 h-5" /></>}
            </button>
            {error && !checking && available !== false && (
              <div className="text-red-400 text-sm mt-4">{error}</div>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
} 