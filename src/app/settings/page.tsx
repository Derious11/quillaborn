import type { Metadata } from "next";
import SettingsPage from "@/components/settings/SettingsPage";

export const metadata: Metadata = {
  title: "Settings — Quillaborn",
  description: "Manage your account, privacy, notifications, preferences, and billing.",
};

export default function Page() {
  return <SettingsPage />;
}
