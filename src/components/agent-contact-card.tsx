"use client";

import { useState } from "react";
import { Mail, Phone, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

interface AgentContactCardProps {
  agent: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  propertyId: string;
  loggedIn: boolean;
}

export function AgentContactCard({ agent, propertyId, loggedIn }: AgentContactCardProps) {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!loggedIn) {
      toast.error("Please log in to message the agent.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: agent.id,
          propertyId,
          subject: subject || undefined,
          messageText: message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not send message.");
        return;
      }
      toast.success("Message sent to " + agent.name);
      setSubject("");
      setMessage("");
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Contact agent</CardTitle>
        <p className="text-sm text-slate-600">{agent.name}</p>
        {agent.phone && (
          <a href={`tel:${agent.phone}`} className="mt-1 flex items-center gap-2 text-sm text-primary hover:underline">
            <Phone className="h-3.5 w-3.5" /> {agent.phone}
          </a>
        )}
        <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
          <Mail className="h-3.5 w-3.5" /> {agent.email}
        </a>
      </CardHeader>
      <CardContent>
        {loggedIn ? (
          <form onSubmit={send} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="subject" className="text-xs">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Interested in this property"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="message" className="text-xs">Message</Label>
              <Textarea
                id="message"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi, I'd like more information about this property…"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-1 h-4 w-4" />}
              Send message
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Log in to send the agent a message about this property.
            </p>
            <Button asChild className="w-full">
              <Link href="/login?next=/dashboard">Log in to contact</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
