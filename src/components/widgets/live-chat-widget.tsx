"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

export function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "Hi! How can we help you today?" },
  ]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    if (!message.trim() || sending) return;
    const text = message.trim();
    setMessages((prev) => [...prev, { role: "user", text }]);
    setMessage("");
    setSending(true);
    try {
      const res = await axios.post("/api/chat", {
        name: name || undefined,
        email: email || undefined,
        message: text,
        sessionId,
      });
      if (res.data.sessionId) setSessionId(res.data.sessionId);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: res.data.reply ?? "Message received!" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, something went wrong. Please try again or use our contact form." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
          open && "bg-muted text-foreground hover:bg-muted"
        )}
        variant={open ? "outline" : "gradient"}
        size="icon"
        aria-label={open ? "Close chat" : "Open live chat"}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </Button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[420px] w-[340px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-white">
            <p className="font-semibold">Live Chat</p>
            <p className="text-xs text-white/80">We typically reply within minutes</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 1 && (
              <div className="grid gap-2">
                <Input placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  m.role === "user"
                    ? "ml-auto bg-indigo-600 text-white"
                    : "bg-muted text-foreground"
                )}
              >
                {m.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2 border-t p-3">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button type="button" size="icon" onClick={sendMessage} disabled={sending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
