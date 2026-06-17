import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/messages
 * Returns all messages where the current user is sender or receiver.
 *
 * POST /api/messages
 * Body: { receiverId, propertyId?, subject?, messageText }
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
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
    take: 200,
  });
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { receiverId, propertyId, subject, messageText } = body;
    if (!receiverId || !messageText) {
      return NextResponse.json({ error: "receiverId and messageText required." }, { status: 400 });
    }
    if (receiverId === user.id) {
      return NextResponse.json({ error: "Cannot message yourself." }, { status: 400 });
    }
    const message = await db.message.create({
      data: {
        senderId: user.id,
        receiverId,
        propertyId: propertyId || null,
        subject: subject || null,
        messageText,
      },
    });
    // Increment the property's enquiry count if attached
    if (propertyId) {
      await db.property.update({
        where: { id: propertyId },
        data: { enquiryCount: { increment: 1 } },
      }).catch(() => {});
    }
    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error("[messages POST] error", err);
    return NextResponse.json({ error: "Could not send message." }, { status: 500 });
  }
}
