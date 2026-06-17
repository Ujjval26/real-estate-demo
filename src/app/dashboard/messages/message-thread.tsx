"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Send, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

interface ThreadMessage {
  id: string;
  text: string;
  subject: string | null;
  createdAt: string;
  isFromMe: boolean;
  read: boolean;
  property: { title: string; slug: string } | null;
}

interface ThreadData {
  otherId: string;
  otherName: string;
  unreadCount: number;
  lastMessage: { text: string; createdAt: string; isFromMe: boolean };
  messages: ThreadMessage[];
}

export function MessageThread({ thread }: { thread: ThreadData }) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [pending, start] = useTransition();

  function sendReply() {
    if (!reply.trim()) return;
    start(async () => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: thread.otherId,
          messageText: reply,
        }),
      });
      if (!res.ok) {
        toast.error("Could not send message.");
        return;
      }
      toast.success("Sent");
      setReply("");
      // Optimistic: add to UI
      thread.messages.push({
        id: `temp-${Date.now()}`,
        text: reply,
        subject: null,
        createdAt: new Date().toISOString(),
        isFromMe: true,
        read: true,
        property: null,
      });
    });
  }

  return (
    <Card>
      <CardContent className="p-4">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-slate-900">
                {thread.otherName}
              </p>
              {thread.unreadCount > 0 && (
                <Badge className="text-[10px]">{thread.unreadCount} new</Badge>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {thread.lastMessage.isFromMe ? "You: " : ""}
              {thread.lastMessage.text}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {new Date(thread.lastMessage.createdAt).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>

        {open && (
          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
            {thread.messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.isFromMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-2.5 text-sm ${
                    m.isFromMe ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-900"
                  }`}
                >
                  {m.subject && (
                    <p className="mb-1 text-xs font-medium opacity-80">{m.subject}</p>
                  )}
                  <p>{m.text}</p>
                  <p className="mt-1 text-[10px] opacity-70">
                    {new Date(m.createdAt).toLocaleString("en-GB", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                  {m.property && (
                    <Link
                      href={`/property/${m.property.slug}`}
                      className="mt-1 block text-[10px] underline opacity-80"
                    >
                      Re: {m.property.title}
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {/* Reply box */}
            <div className="flex gap-2 border-t border-slate-100 pt-3">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={`Reply to ${thread.otherName}…`}
                rows={2}
                className="min-h-[44px]"
              />
              <Button onClick={sendReply} disabled={pending || !reply.trim()} size="icon">
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
