import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  text: string;
  isAdmin: boolean;
  createdAt: string;
  read?: boolean;
};

const STORAGE_KEY = "thebox-messages";

const readMessages = (): ChatMessage[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChatMessage[]) : [];
  } catch {
    return [];
  }
};

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

type MessagesPageProps = {
  onBackToAccount: () => void;
};

export function MessagesPage({ onBackToAccount }: MessagesPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(readMessages);
  const [draft, setDraft] = useState("");
  const [mobileDraft, setMobileDraft] = useState("");
  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const next = [
      ...messages,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text: trimmed,
        isAdmin: false,
        createdAt: new Date().toISOString(),
      },
    ];
    setMessages(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // stockage indisponible
    }
    setDraft("");
    setMobileDraft("");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between border-b pb-4 border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold mb-1 tracking-tight text-gray-900">
            Messagerie
          </h1>
          <p className="text-gray-500 font-medium">
            Discutez avec l'administration et suivez vos demandes en temps réel.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToAccount}
          className="text-sm font-semibold text-gray-600 hover:text-black flex items-center gap-2 bg-gray-100 px-4 py-2.5 rounded-full transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour au compte
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-start">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-[650px] overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <img
                src="/logo.jpg"
                alt="The Box"
                className="w-full h-full object-cover rounded-full p-1 bg-white"
              />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Support The Box</h3>
              <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                En ligne
              </div>
            </div>
          </div>

          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 scroll-smooth"
            id="chatContainer"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-gray-900 mb-1">
                  Aucun message pour le moment.
                </p>
                <p className="text-sm text-gray-500 max-w-sm">
                  Vous avez une question sur une commande ou un article ?
                  N'hésitez pas à nous écrire.
                </p>
              </div>
            ) : (
              messages.map((msg) =>
                msg.isAdmin ? (
                  <div key={msg.id} className="flex justify-start w-full group">
                    <div className="max-w-[85%] sm:max-w-[75%]">
                      <div className="flex items-center gap-2 mb-1.5 ml-1">
                        <span className="text-xs font-bold text-gray-900">
                          Support The Box
                        </span>
                        <span className="text-[10px] font-medium text-gray-400">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                      <div className="bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-5 py-3.5 text-[0.95rem] leading-relaxed whitespace-pre-wrap shadow-sm">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="flex justify-end w-full group">
                    <div className="max-w-[85%] sm:max-w-[75%]">
                      <div className="flex items-center justify-end gap-2 mb-1.5 mr-1">
                        <span className="text-[10px] font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatTime(msg.createdAt)}
                        </span>
                        <span className="text-xs font-bold text-gray-900">Vous</span>
                      </div>
                      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-3.5 text-[0.95rem] leading-relaxed whitespace-pre-wrap shadow-md">
                        {msg.text}
                      </div>
                      {msg.read ? (
                        <div className="flex justify-end mt-1 mr-1">
                          <p className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Vu par l'équipe
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ),
              )
            )}
          </div>

          <div className="lg:hidden border-t border-gray-200 bg-white p-4">
            <form
              className="flex items-end gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(mobileDraft);
              }}
            >
              <div className="flex-1 relative">
                <textarea
                  rows={1}
                  required
                  value={mobileDraft}
                  onChange={(event) => {
                    setMobileDraft(event.target.value);
                    event.target.style.height = "";
                    event.target.style.height = `${event.target.scrollHeight}px`;
                  }}
                  className="w-full bg-gray-100 border-transparent rounded-full pl-5 pr-12 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-black focus:border-black outline-none transition-all resize-none max-h-32"
                  placeholder="Écrivez votre message..."
                />
              </div>
              <button
                type="submit"
                className="w-12 h-12 flex-shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-transform active:scale-95"
                aria-label="Envoyer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        <div className="hidden lg:block bg-white border border-gray-200 rounded-2xl p-7 shadow-sm sticky top-24">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Envoyer un message
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Notre équipe vous répondra dans les plus brefs délais.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(draft);
            }}
          >
            <div className="mb-5">
              <textarea
                id="messageDesktop"
                rows={6}
                required
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-[0.95rem] focus:bg-white focus:ring-2 focus:ring-black focus:border-black outline-none transition-all resize-none"
                placeholder="Que souhaitez-vous nous dire ?"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Envoyer le message
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
