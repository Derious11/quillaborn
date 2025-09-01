"use client";

import React from "react";

type Props = {
  q: string;
  status: string;
  base?: string; // default /admin/waitlist
};

export default function WaitlistFilters({ q, status, base = "/admin/waitlist" }: Props) {
  const formRef = React.useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      className="flex flex-wrap gap-2 mb-6"
      action={base}
      method="GET"
    >
      <input
        name="q"
        defaultValue={q}
        placeholder="Search email"
        className="border border-gray-700 bg-gray-800/60 text-white placeholder:text-gray-400 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/40"
      />
      <select
        name="status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className="border border-gray-700 bg-gray-800/80 text-white rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40"
      >
        <option value="pending">pending</option>
        <option value="approved">approved</option>
        <option value="All">All</option>
      </select>
    </form>
  );
}

