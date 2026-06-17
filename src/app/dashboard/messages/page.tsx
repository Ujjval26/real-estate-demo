import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { MessageThread } from "./message-thread";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/messages");

  const messages = await db.message.findMany({
    where: {
      OR: [{ senderId: user.id }, { receiverId: user.id }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
      property: { select: { id: true, title: true, slug: true } },
    },
    take: 100,
  });

  // Group messages by the "other party" (the person who isn't the current user)
  const threads = new Map<string, {
    otherId: string;
    otherName: string;
    messages: typeof messages;
    lastMessage: typeof messages[number];
    unreadCount: number;
  }>();

  for (const m of messages) {
    const otherId = m.senderId === user.id ? m.receiverId : m.senderId;
    const otherName = m.senderId === user.id ? m.receiver.name : m.sender.name;
    if (!threads.has(otherId)) {
      threads.set(otherId, { otherId, otherName, messages: [], lastMessage: m, unreadCount: 0 });
    }
    const t = threads.get(otherId)!;
    t.messages.push(m);
    if (m.receiverId === user.id && !m.readStatus) t.unreadCount++;
    if (m.createdAt > t.lastMessage.createdAt) t.lastMessage = m;
  }

  const sortedThreads = Array.from(threads.values()).sort(
    (a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime(),
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={{ name: user.name, role: user.role }} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Messages</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your conversations with agents and other users.
        </p>

        {sortedThreads.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="p-12 text-center">
              <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                No messages yet. Message an agent from any property page.
              </p>
              <Link
                href="/search"
                className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
              >
                Browse properties →
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 space-y-3">
            {sortedThreads.map((thread) => (
              <MessageThread
                key={thread.otherId}
                thread={{
                  otherId: thread.otherId,
                  otherName: thread.otherName,
                  unreadCount: thread.unreadCount,
                  lastMessage: {
                    text: thread.lastMessage.messageText,
                    createdAt: thread.lastMessage.createdAt.toISOString(),
                    isFromMe: thread.lastMessage.senderId === user.id,
                  },
                  messages: thread.messages.map((m) => ({
                    id: m.id,
                    text: m.messageText,
                    subject: m.subject,
                    createdAt: m.createdAt.toISOString(),
                    isFromMe: m.senderId === user.id,
                    read: m.readStatus,
                    property: m.property
                      ? { title: m.property.title, slug: m.property.slug }
                      : null,
                  })),
                }}
              />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
