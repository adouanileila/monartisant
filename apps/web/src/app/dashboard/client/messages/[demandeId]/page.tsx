import ChatThread from "@/components/chat/ChatThread";

interface Props {
  params: Promise<{ demandeId: string }>;
}

// Server Component — unwraps the async params and passes demandeId to
// the client-side ChatThread component.
export default async function ClientChatPage({ params }: Props) {
  const { demandeId } = await params;
  return <ChatThread demandeId={demandeId} />;
}