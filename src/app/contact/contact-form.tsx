"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

export function ContactForm({ defaultName, defaultEmail }: { defaultName: string; defaultEmail: string }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate sending (this is a demo — no backend endpoint)
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast.success("Thanks — we'll be in touch soon!");
    setSubject("");
    setMessage("");
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="name" className="text-xs">Name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="subject" className="text-xs">Subject</Label>
        <Input id="subject" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we help?" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="message" className="text-xs">Message</Label>
        <Textarea id="message" required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
        Send message
      </Button>
    </form>
  );
}
