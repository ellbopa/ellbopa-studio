"use client";

import { useState, useTransition } from "react";
import { Bot, Send, X } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Dime que necesitas y te recomiendo servicio, beat o reserva." }
  ]);
  const [pending, startTransition] = useTransition();

  return (
    <div className="fixed bottom-5 right-24 z-50 md:bottom-24 md:right-5">
      {open ? (
        <div className="premium-card w-[min(92vw,360px)] overflow-hidden rounded-lg">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-2 font-bold"><Bot className="text-studio-gold" /> Asistente Ellbopa</div>
            <button onClick={() => setOpen(false)} className="rounded-md p-2 text-white/60 hover:bg-white/10" aria-label="Cerrar asistente"><X size={18} /></button>
          </div>
          <div className="max-h-80 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={index} className={`rounded-lg px-3 py-2 text-sm leading-6 ${message.role === "assistant" ? "bg-white/[0.06] text-white/78" : "ml-8 bg-studio-red text-white"}`}>
                {message.text}
              </div>
            ))}
          </div>
          <form
            className="flex gap-2 border-t border-white/10 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const formData = new FormData(form);
              const text = String(formData.get("message") ?? "");
              if (!text.trim()) return;
              setMessages((current) => [...current, { role: "user", text }]);
              form.reset();
              startTransition(async () => {
                const response = await fetch("/api/ai/recommend", {
                  method: "POST",
                  body: JSON.stringify({ message: text }),
                  headers: { "Content-Type": "application/json" }
                });
                const data = (await response.json()) as { reply: string };
                setMessages((current) => [...current, { role: "assistant", text: data.reply }]);
              });
            }}
          >
            <input name="message" placeholder="Ej: tengo una cancion sin mezclar" className="min-w-0 flex-1 rounded-md border border-white/10 bg-black px-3 py-2 text-sm" />
            <button disabled={pending} className="grid h-10 w-10 place-items-center rounded-md bg-studio-red glow-button" aria-label="Enviar"><Send size={16} /></button>
          </form>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="grid h-14 w-14 place-items-center rounded-full bg-studio-red text-white shadow-glow transition hover:scale-105" aria-label="Abrir asistente IA">
          <Bot />
        </button>
      )}
    </div>
  );
}
