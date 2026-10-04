"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { socket } from "@/lib/socket";
import { orpc } from "@/utils/orpc";
import { Send, Loader2, MessageCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  demandeId: string;
  expediteurId: string;
  destinataireId: string;
  contenu: string;
  type: "texte" | "image";
  dateCreation: string | Date; // string from REST API (JSON), Date from socket
}

interface Props {
  demandeId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatThread({ demandeId }: Props) {
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [texte, setTexte] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── 1. Load message history ────────────────────────────────────────────────
  const { data: historique, isLoading: histLoading } = useQuery(
    orpc.getMessages.queryOptions({ input: { demandeId } }),
  );

  // ── 2. Fetch the demande to resolve destinataireId ─────────────────────────
  const { data: demandeInfo } = useQuery(
    orpc.getDemandeById.queryOptions({ input: { demandeId } }),
  );

  /**
   * Resolve the OTHER participant's user.id:
   *   - If I am the client  → other = artisan's user.id (artisanUserId)
   *   - If I am the artisan → other = the demande's clientId
   */
  const destinataireId: string | null = (() => {
    if (!demandeInfo || !currentUserId) return null;
    if (demandeInfo.clientId === currentUserId) {
      // I am the client — send to artisan's user.id
      return demandeInfo.artisanUserId ?? null;
    }
    // I am the artisan (or fallback) — send to client
    return demandeInfo.clientId;
  })();

  // ── 3. Seed messages from history ─────────────────────────────────────────
  useEffect(() => {
    if (historique) setMessages(historique as unknown as ChatMessage[]);
  }, [historique]);

  // ── 4. Socket lifecycle ────────────────────────────────────────────────────
  useEffect(() => {
    socket.connect();
    socket.emit("join-demande", demandeId);

    const onNewMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        // Deduplicate: socket echoes back to sender too
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on("new-message", onNewMessage);

    return () => {
      socket.off("new-message", onNewMessage);
      socket.disconnect();
    };
  }, [demandeId]);

  // ── 5. Auto-scroll to bottom on new messages ──────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── 6. Send ───────────────────────────────────────────────────────────────
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!texte.trim() || !currentUserId || !destinataireId) return;

    socket.emit("send-message", {
      demandeId,
      expediteurId: currentUserId,
      destinataireId,
      contenu: texte.trim(),
      type: "texte" as const,
    });

    setTexte("");
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-slate-900">Conversation</h1>
          <p className="text-xs text-slate-400 truncate max-w-xs">
            {demandeInfo?.description ?? "Chargement…"}
          </p>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-2">
        {histLoading ? (
          /* Skeleton */
          <div className="flex flex-col gap-3">
            {[60, 40, 70].map((w, i) => (
              <div
                key={i}
                className={`animate-pulse h-9 rounded-2xl bg-slate-100 ${
                  i % 2 === 0 ? "self-end" : "self-start"
                }`}
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center flex-1 text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <MessageCircle className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">Aucun message pour l'instant</p>
            <p className="text-xs text-slate-400 mt-1">Commencez la conversation ci-dessous.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMine = m.expediteurId === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex flex-col max-w-[72%] ${isMine ? "self-end items-end" : "self-start items-start"}`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? "bg-emerald-500 text-white rounded-br-md"
                      : "bg-slate-100 text-slate-800 rounded-bl-md"
                  }`}
                >
                  {m.contenu}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {m.dateCreation
                    ? new Date(m.dateCreation).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 pt-3 border-t border-slate-100"
      >
        <input
          type="text"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder={
            destinataireId === null
              ? "En attente d'un artisan…"
              : "Écrire un message…"
          }
          disabled={destinataireId === null}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 disabled:opacity-50 transition"
        />
        <button
          type="submit"
          disabled={!texte.trim() || destinataireId === null}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white transition-colors shrink-0"
        >
          {!texte.trim() ? (
            <Send className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Warning when destinataireId not yet resolvable */}
      {!histLoading && destinataireId === null && demandeInfo && (
        <p className="text-xs text-amber-600 text-center mt-2">
          La demande n'a pas encore été acceptée par un artisan.
        </p>
      )}
    </div>
  );
}
