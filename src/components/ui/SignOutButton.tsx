"use client"
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const { supabase } = useSupabase();
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };
  
  return (
    <button 
      onClick={signOut}
      className="bg-green-500 hover:bg-green-600 text-gray-900 font-medium px-4 py-2 rounded-lg transition-colors"
    >
      Sign Out
    </button>
  );
}