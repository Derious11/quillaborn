export default function AccessDeniedPage() {
  return (
    <div className="max-w-xl mx-auto py-16 space-y-8">
      <h1 className="text-2xl font-semibold">Access pending</h1>
      <p className="text-sm opacity-80">
        You’re signed in, but this email doesn’t have early access yet.
      </p>

      <div className="space-y-6">
        <section className="p-4 rounded-xl border">
          <h2 className="font-medium mb-2">Already joined with another email?</h2>
          <form className="space-y-3" action="/api/request-link-waitlist" method="post">
            <input name="waitlist_email" placeholder="your-waitlist@email..." className="w-full border rounded px-3 py-2" />
            <button className="px-4 py-2 rounded bg-black text-white">Send verification link</button>
          </form>
          <p className="text-xs opacity-70 mt-2">We’ll send a one-time link to confirm and grant access instantly.</p>
        </section>

        <section className="p-4 rounded-xl border">
          <h2 className="font-medium mb-2">Request access with this email</h2>
          <form className="space-y-3" action="/api/request-access" method="post">
            <button className="px-4 py-2 rounded bg-black text-white">Request access</button>
          </form>
          <p className="text-xs opacity-70 mt-2">We’ll add you to the waitlist and notify you when access opens.</p>
        </section>
      </div>
    </div>
  );
}
