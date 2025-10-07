import { getThreadWithComments } from "@/lib/community/communityServer";
import ThreadPage from "@/components/features/user/dashboard/ThreadPage";

interface Props {
  params: { id: string };
}

export default async function CommunityThreadRoute({ params }: Props) {
  const { thread, comments } = await getThreadWithComments(params.id);
  return <ThreadPage thread={thread} initialComments={comments} />;
}
