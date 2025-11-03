import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type FeatureFlagRow = {
  key: string;
  description: string | null;
  enabled_default: boolean;
};

export default async function AdminSettingsPage() {
  const supabase = createSupabaseServerClient();

  // Guard
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!me || !["admin", "owner"].includes(me.role)) redirect("/403");

  // Try to read feature flags; if table doesn't exist, ignore errors
  let flags: FeatureFlagRow[] = [];
  try {
    const untyped = supabase as SupabaseClient<any>;
    const { data } = await untyped
      .schema("admin")
      .from("feature_flags")
      .select("key,description,enabled_default");
    if (Array.isArray(data)) {
      flags = data.map((flag) => ({
        key: flag.key,
        description: flag.description ?? null,
        enabled_default: Boolean(flag.enabled_default),
      }));
    }
  } catch {
    /* noop */
  }

  return (
    <main>
      <h1 className="text-3xl font-extrabold mb-6">Admin Settings</h1>

      <section className="rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur p-5 mb-6">
        <h2 className="text-xl font-bold mb-2">Feature Flags</h2>
        {flags.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No feature flags yet. (Create tables <code>admin.feature_flags</code> and{" "}
            <code>admin.feature_flag_overrides</code> when ready.)
          </p>
        ) : (
          <ul className="space-y-2">
            {flags.map((f) => (
              <li key={f.key} className="flex items-center justify-between border-b border-white/5 pb-2">
                <div>
                  <div className="font-semibold">{f.key}</div>
                  <div className="text-sm text-gray-400">{f.description ?? "No description"}</div>
                </div>
                <div className="text-sm text-gray-300">Default: {f.enabled_default ? "On" : "Off"}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur p-5">
        <h2 className="text-xl font-bold mb-2">Email Templates</h2>
        <p className="text-gray-400 text-sm">
          Coming soon: manage operational email templates and previews (verification resend, onboarding nudge).
        </p>
      </section>
    </main>
  );
}
