import LandingPage from "@/components/features/public/LandingPage";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Home — Quillaborn",
  description: "Home page for the Quillaborn platform.",
};

export default function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const sp = searchParams || {};
  if ("code" in sp || "token_hash" in sp) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (Array.isArray(v)) v.forEach((val) => qs.append(k, String(val)));
      else if (typeof v === "string") qs.set(k, v);
    }
    redirect(`/auth/callback?${qs.toString()}`);
  }
  return <LandingPage />;
}

