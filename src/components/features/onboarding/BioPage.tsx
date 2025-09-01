"use client";

import { useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ChevronDown } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LegalModal from "@/components/ui/LegalModal";

interface LegalDocument {
  id: number;
  document_type: string;
  version: string;
  title: string;
  content: string;
  is_latest: boolean;
  published_at: string;
}

interface BioPageProps {
  user: {
    id: string;
    displayName: string;
    username: string;
    bio: string;
    pronouns: string;
  };
  pronounsList: Array<{
    id: number;
    display_text: string;
  }>;
}

export default function BioPage({ user, pronounsList }: BioPageProps) {
  const { supabase } = useSupabase();
  const [bio, setBio] = useState(user.bio);
  const [selectedPronouns, setSelectedPronouns] = useState<string>(user.pronouns);
  const [showPronounsDropdown, setShowPronounsDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const [modalDocument, setModalDocument] = useState<LegalDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [termsVersion, setTermsVersion] = useState<string>("1.0");
  const [privacyVersion, setPrivacyVersion] = useState<string>("1.0");
  const router = useRouter();

  const fetchLegalDocument = async (documentType: string) => {
    setLoadingDocument(true);
    setError(null);
    
    // Convert to uppercase to match database values
    const dbDocumentType = documentType.toUpperCase();
    
    try {
      const { data, error } = await supabase
        .from("legal_documents")
        .select("*")
        .eq("document_type", dbDocumentType)
        .eq("is_latest", true)
        .single();

      if (error) {
        console.error("Error fetching legal document:", error);
        if (error.code === 'PGRST116') {
          setError(`No ${documentType.replace('_', ' ')} document found. Please contact support.`);
        } else {
          setError("Failed to load document. Please try again.");
        }
      } else if (data) {
        setModalDocument(data);
        setIsModalOpen(true);
        
        // Store the version for use in onboarding completion
        if (data.document_type === 'TERMS_OF_SERVICE') {
          setTermsVersion(data.version);
        } else if (data.document_type === 'PRIVACY_POLICY') {
          setPrivacyVersion(data.version);
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load document. Please try again.");
    } finally {
      setLoadingDocument(false);
    }
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms || !agreeToPrivacy) {
      setError("Please agree to both Terms of Service and Privacy Policy.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let pronounsValue = null;
      
      if (selectedPronouns !== '') {
        // Find the pronoun object that matches the selected display_text
        const selectedPronoun = pronounsList.find(p => p.display_text === selectedPronouns);
        if (selectedPronoun) {
          // Store the ID since pronouns column is a foreign key
          pronounsValue = selectedPronoun.id;
        }
      }

      // Call the RPC function with the correct parameters
      const { error: rpcError } = await supabase
        .rpc('complete_onboarding', {
          input_bio: bio.trim() || null,
          input_pronoun_id: pronounsValue,
          input_terms_version: termsVersion,
          input_privacy_version: privacyVersion
        });

      if (rpcError) {
        setError("Failed to complete onboarding. Please try again.");
        setSaving(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Failed to complete onboarding. Please try again.");
      setSaving(false);
    }
  };

  // Skip option removed: users must complete this step after agreeing to legal documents.

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
              Step 4 of 4
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 flex justify-center items-center gap-2">
            <Sparkles className="text-green-400" /> Tell Us About Yourself
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Share a bit about yourself with the community. This helps others connect with you.
          </p>
          
          <form onSubmit={handleNext} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="bio" className="block text-left text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your story, what you create, or what inspires you..."
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={500}
                  disabled={saving}
                />
                <div className="text-right text-sm text-gray-400 mt-1">
                  {bio.length}/500
                </div>
              </div>

              <div>
                <label htmlFor="pronouns" className="block text-left text-sm font-medium text-gray-300 mb-2">
                  Pronouns (Optional)
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPronounsDropdown(!showPronounsDropdown)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent flex items-center justify-between"
                    disabled={saving}
                  >
                    <span className={selectedPronouns ? "text-white" : "text-gray-400"}>
                      {selectedPronouns || "Select pronouns..."}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showPronounsDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showPronounsDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPronouns("");
                          setShowPronounsDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-600 transition-colors border-b border-gray-600"
                      >
                        <span className="text-gray-400">No preference</span>
                      </button>
                      {pronounsList.map((pronoun) => (
                        <button
                          key={pronoun.id}
                          type="button"
                          onClick={() => {
                            setSelectedPronouns(pronoun.display_text);
                            setShowPronounsDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-600 transition-colors"
                        >
                          {pronoun.display_text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Legal Agreements Section */}
            <div className="space-y-4 border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-white">Legal Agreements</h3>
              
              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                    disabled={saving}
                  />
                  <span className="text-sm text-gray-300">
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => fetchLegalDocument("terms_of_service")}
                      disabled={loadingDocument}
                      className="text-green-400 hover:text-green-300 underline"
                    >
                      Terms of Service
                    </button>
                    .
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeToPrivacy}
                    onChange={(e) => setAgreeToPrivacy(e.target.checked)}
                    className="mt-1 w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                    disabled={saving}
                  />
                  <span className="text-sm text-gray-300">
                    I have read and understand the{" "}
                    <button
                      type="button"
                      onClick={() => fetchLegalDocument("privacy_policy")}
                      disabled={loadingDocument}
                      className="text-green-400 hover:text-green-300 underline"
                    >
                      Privacy Policy
                    </button>
                    .
                  </span>
                </label>
              </div>
            </div>
            
            {error && (
              <div className="text-red-400 text-sm mt-4">{error}</div>
            )}
            
            <div className="flex">
              <button
                type="submit"
                disabled={!agreeToTerms || !agreeToPrivacy || saving}
                className="w-full bg-green-500 hover:bg-green-600 text-gray-900 px-8 py-4 rounded-full font-bold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 justify-center disabled:opacity-50"
              >
                {saving ? "Completing..." : <>Complete Onboarding <ArrowRight className="w-5 h-5" /></>}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
      
      {/* Legal Document Modal */}
      <LegalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalDocument(null);
        }}
        document={modalDocument}
      />
    </div>
  );
} 
