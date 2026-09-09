import { NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const { message, chatIds } = await request.json();

    if (!message || !Array.isArray(chatIds) || chatIds.length === 0) {
      return NextResponse.json({ error: "Missing message or chatIds" }, { status: 400 });
    }

    let successCount = 0;
    for (const chatId of chatIds) {
      const success = await sendTelegramMessage(chatId.toString(), message);
      if (success) successCount++;
    }

    return NextResponse.json({ success: true, count: successCount });
  } catch (error) {
    console.error("Error sending telegram notifications:", error);
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 });
  }
}
