// Lightweight client-side helper to retrieve waitlist status
// Returns one of: 'approved' | 'pending' | 'unknown'
export async function getWaitlistStatus(email: string): Promise<'approved' | 'pending' | 'unknown'> {
  const normalized = (email || '').toLowerCase().trim();
  if (!normalized) return 'unknown';
  try {
    const res = await fetch(`/api/waitlist/status?email=${encodeURIComponent(normalized)}` , { cache: 'no-store' });
    if (!res.ok) return 'unknown';
    const js = await res.json().catch(() => ({ status: 'unknown' }));
    const status = (js?.status || 'unknown').toString().toLowerCase();
    return (status === 'approved' || status === 'pending') ? status : 'unknown';
  } catch {
    return 'unknown';
  }
}

