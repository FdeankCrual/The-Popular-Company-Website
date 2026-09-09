export async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN is not set. Cannot send notification.");
    return false;
  }
  
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      }),
    });
    
    if (!res.ok) {
      console.error("Failed to send telegram message", await res.text());
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Telegram API Error", error);
    return false;
  }
}
