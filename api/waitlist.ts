import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email } = req.body as { email?: string };

  // Basic validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  // DISCORD_WEBHOOK_URL has NO VITE_ prefix — it is a private server-side secret
  const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

  if (!DISCORD_WEBHOOK_URL) {
    console.error('Missing DISCORD_WEBHOOK_URL environment variable on server.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    const discordRes = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            title: '🚀 New Waitlist Signup!',
            description: `A new user has joined the Veilpay waitlist.\n\n**Email:** \`${email}\``,
            color: 15909234, // Amber color to match Veilpay
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    if (!discordRes.ok) {
      const errorText = await discordRes.text();
      console.error('Discord Webhook Error:', discordRes.status, errorText);
      return res.status(502).json({ error: 'Failed to forward to Discord.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Unexpected error in waitlist handler:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
