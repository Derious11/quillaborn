import { getCommunityData } from "@/lib/community/communityServer";
import CommunityPage from "@/components/features/user/dashboard/CommunityPage";

export default async function CommunityRoute() {
  const { categories, threads } = await getCommunityData();
  return <CommunityPage initialCategories={categories} initialThreads={threads} />;
}
